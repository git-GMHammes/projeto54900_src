<?php

namespace App\Services\V1\ChatRooms\ChatMessages;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\ChatRooms\ChatMessages\SqlTableModel;
use App\Models\V1\ChatRooms\ChatMessageEdits\SqlTableModel as ChatMessageEditsModel;
use App\Models\V1\ChatRooms\ChatMessageMentions\SqlTableModel as ChatMessageMentionsModel;
use App\Models\V1\ChatRooms\ChatMessages\SqlViewModel;
use App\Models\V1\ChatRooms\ChatRoomAttachments\SqlViewModel as ChatRoomAttachmentsViewModel;
use App\Models\V1\ChatRooms\ChatRoomMembers\SqlTableModel as ChatRoomMembersModel;
use App\Models\V1\ChatRooms\ChatRoomsManager\SqlTableModel as ChatRoomsManagerModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo ChatRooms/ChatMessages.
 *
 * Regras aplicadas aqui (README_modulo_chatrooms.md §4):
 *
 *  - Guest nao cria/edita/exclui mensagem nenhuma (403) — so pode ler.
 *  - Create exige sala existente e status='open' (senao 404/409 com o texto
 *    fixo do README) e usuario com user_manager.status='active'.
 *  - Autor e sempre o usuario da sessao (user_manager_id do corpo e
 *    ignorado); status sempre nasce 'sent'.
 *  - Conteudo e imutavel para usuario comum; so admin edita (README §4, regra 11).
 *    Cada edicao grava o texto anterior em chat_message_edits, na mesma
 *    transacao. status=removed segue para autor, moderador da sala ou admin.
 *    update/delete-* sao permitidos ao autor da mensagem, ao moderador da sala
 *    (owner_user_manager_id) ou a admin.
 *  - clear-deleted e so admin (defesa em profundidade — a rota ja tem filtro
 *    adminonly).
 *  - Filtro de palavrao (dicionario JSON) e entrada automatica em
 *    chat_room_members na primeira mensagem sao integracao futura: os
 *    modulos/dependencias (dicionario estatico, ChatRoomMembers) ainda nao
 *    existem. Quando existirem, prepareData() deve gravar status='blocked' +
 *    linha em chat_room_warnings quando a mensagem contiver termo proibido,
 *    e garantir o UPSERT em chat_room_members antes do insert.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private ChatRoomsManagerModel $roomsModel;
    private UserManagerModel $usersModel;
    private ChatRoomMembersModel $membersModel;
    private ChatMessageMentionsModel $mentionsModel;
    private ChatMessageEditsModel $editsModel;

    public function __construct()
    {
        $this->tableModel    = new SqlTableModel();
        $this->viewModel     = new SqlViewModel();
        $this->roomsModel    = new ChatRoomsManagerModel();
        $this->usersModel    = new UserManagerModel();
        $this->membersModel  = new ChatRoomMembersModel();
        $this->mentionsModel = new ChatMessageMentionsModel();
        $this->editsModel    = new ChatMessageEditsModel();
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $roomId = (int) ($data['chat_rooms_manager_id'] ?? 0);
        $room   = $roomId > 0 ? $this->roomsModel->find($roomId) : null;

        if ($room === null) {
            return $this->notFound('Sala nao encontrada');
        }

        if (($room['status'] ?? null) !== 'open') {
            return $this->conflict('Sala fechada, procure o moderador da sala para entender o motivo.');
        }

        $user = $this->usersModel->find((int) CurrentUser::id());

        if ($user === null || ($user['status'] ?? null) !== 'active') {
            return $this->forbidden('Somente usuario ativo pode enviar mensagens');
        }

        if (!$this->isActiveMember($roomId, (int) CurrentUser::id())) {
            return $this->forbidden('Entre na sala para enviar mensagens');
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $data['user_manager_id'] = (int) CurrentUser::id();
        $data['status']          = 'sent';

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['chat_rooms_manager_id'], $data['user_manager_id']);

        // content só passa daqui para o admin (update() já barra os demais).
        if (!CurrentUser::isAdmin()) {
            unset($data['content']);
        }

        return $data;
    }

    // -------------------------------------------------------------------------
    // Escrita — autor, moderador da sala ou admin
    // -------------------------------------------------------------------------

    /**
     * Create da mensagem + menções (opcionais) numa só transação. As menções
     * são conferidas antes do insert: cada usuário precisa ser membro ativo
     * da sala, senão nada é gravado.
     */
    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $memberships = $this->mentionIds($data['mentions'] ?? null);
        if ($memberships === null) {
            return $this->invalid('Menção inválida: informe os vínculos de membro da sala');
        }
        unset($data['mentions']);

        $mentions = [];
        if ($memberships !== []) {
            $guarded = $this->resolveMentionUsers((int) ($data['chat_rooms_manager_id'] ?? 0), $memberships, $mentions);
            if ($guarded !== null) {
                return $guarded;
            }
        }

        $db = $this->tableModel->db;
        $db->transStart();

        $result = parent::create($data);

        if ($result['success'] && $mentions !== []) {
            $messageId = (int) ($result['data']['id'] ?? 0);

            foreach ($mentions as $userId) {
                $this->mentionsModel->insert([
                    'chat_message_id' => $messageId,
                    'user_manager_id' => $userId,
                ]);
            }
        }

        $db->transComplete();

        if (!$db->transStatus()) {
            return ['success' => false, 'message' => 'Erro ao gravar mensagem e menções', 'code' => 500];
        }

        return $result;
    }

    /**
     * Update de status (removed) ou de conteúdo (só admin). Edição de conteúdo
     * grava o texto anterior em chat_message_edits na mesma transação.
     */
    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $hasContent = array_key_exists('content', $data);
        $hasStatus  = isset($data['status']) && $data['status'] !== '';

        if (!$hasContent && !$hasStatus) {
            return $this->invalid('Informe o conteudo ou o status');
        }

        if ($hasContent) {
            if (!CurrentUser::isAdmin()) {
                return $this->forbidden('Somente admin pode editar o conteudo da mensagem');
            }

            $content = trim((string) $data['content']);
            if ($content === '') {
                return $this->invalid('A mensagem nao pode ficar vazia');
            }
            $data['content'] = $content;
        }

        $guarded = $this->assertAuthorOrModerator($id);
        if ($guarded !== null) {
            return $guarded;
        }

        if (!$hasContent) {
            return parent::update($id, $data);
        }

        $existing = $this->tableModel->find($id);
        if ($existing === null) {
            return $this->notFound();
        }

        $db = $this->tableModel->db;
        $db->transStart();

        $this->editsModel->insert([
            'chat_message_id'           => $id,
            'content_before'            => (string) $existing['content'],
            'edited_by_user_manager_id' => (int) CurrentUser::id(),
        ]);

        $result = parent::update($id, $data);

        $db->transComplete();

        if (!$db->transStatus()) {
            return ['success' => false, 'message' => 'Erro ao gravar a edicao da mensagem', 'code' => 500];
        }

        return $result;
    }

    public function deleteSoft(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthorOrModerator($id);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthorOrModerator($id, true);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthorOrModerator($id, true);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode limpar registros excluidos');
        }

        return parent::clearDeleted($id);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    private function assertAuthorOrModerator(int $id, bool $includeDeleted = false): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        $existing = $includeDeleted
            ? $this->tableModel->findWithDeleted($id)
            : $this->tableModel->find($id);

        if ($existing === null) {
            return $this->notFound();
        }

        $currentUserId = (int) CurrentUser::id();
        $isAuthor       = (int) ($existing['user_manager_id'] ?? 0) === $currentUserId;

        if ($isAuthor) {
            return null;
        }

        $room = $this->roomsModel->find((int) ($existing['chat_rooms_manager_id'] ?? 0));
        $isModerator = $room !== null && (int) ($room['owner_user_manager_id'] ?? 0) === $currentUserId;

        if ($isModerator) {
            return null;
        }

        return $this->forbidden('Somente o autor da mensagem ou o moderador da sala pode alterar ou excluir');
    }

    /**
     * Normaliza `mentions` para lista de ids unicos. Null = formato invalido.
     *
     * @return list<int>|null
     */
    private function mentionIds(mixed $raw): ?array
    {
        if ($raw === null || $raw === '' || $raw === []) {
            return [];
        }

        $ids = [];

        foreach ((array) $raw as $value) {
            if (!is_numeric($value) || (int) $value <= 0) {
                return null;
            }

            $ids[] = (int) $value;
        }

        return array_values(array_unique($ids));
    }

    /**
     * Cada id recebido é um vínculo de chat_room_members. Precisa ser da
     * mesma sala e estar ativo; o usuário gravado é o user_manager_id dele.
     *
     * @param list<int> $memberships
     * @param list<int> $userIds      preenchido por referência
     */
    private function resolveMentionUsers(int $roomId, array $memberships, array &$userIds): ?array
    {
        foreach ($memberships as $membershipId) {
            $member = $this->membersModel
                ->where('id', $membershipId)
                ->where('chat_rooms_manager_id', $roomId)
                ->where('status', 'active')
                ->first();

            if ($member === null) {
                return $this->invalid('Vínculo ' . $membershipId . ' não é membro ativo desta sala');
            }

            $userIds[] = (int) $member['user_manager_id'];
        }

        $userIds = array_values(array_unique($userIds));

        return null;
    }

    private function invalid(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 422];
    }

    /**
     * Mensagens enviadas de uma sala (status sent), mais antigas primeiro.
     * Só membro ativo da sala ou admin lê. Limite: últimas 200.
     */
    public function listRoom(int $roomId): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        if (!CurrentUser::isAdmin() && !$this->isActiveMember($roomId, (int) CurrentUser::id())) {
            return $this->forbidden('Entre na sala para ver as mensagens');
        }

        $rows = $this->viewModel
            ->where('cm_chat_rooms_manager_id', $roomId)
            ->where('cm_status', 'sent')
            ->where('deleted_at', null)
            ->orderBy('id', 'DESC')
            ->findAll(200);

        // Anexos das mensagens listadas. Membro comum não vê anexo bloqueado (admin vê).
        $attachmentsByMessage = [];
        $messageIds = array_map(static fn ($row) => (int) $row['id'], $rows);
        if ($messageIds !== []) {
            $attachmentRows = (new ChatRoomAttachmentsViewModel())
                ->whereIn('cra_chat_message_id', $messageIds)
                ->where('deleted_at', null)
                ->orderBy('id', 'ASC')
                ->findAll(500);

            foreach ($attachmentRows as $att) {
                $status = (string) ($att['cra_status'] ?? '');
                $isBlocked = $status === 'blocked';
                $isAdmin = CurrentUser::isAdmin();

                // Inativo some para todos. Bloqueado (denúncia) aparece para todos como
                // aviso; só o admin recebe nome, categoria e tamanho.
                if (!$isAdmin && $status !== 'active' && !$isBlocked) {
                    continue;
                }

                $hideDetails = !$isAdmin && $isBlocked;

                $attachmentsByMessage[(int) $att['cra_chat_message_id']][] = [
                    'id'       => (int) $att['id'],
                    'status'   => $isBlocked ? 'blocked' : 'active',
                    'name'     => $hideDetails ? '' : (string) (($att['cra_original_name'] ?? '') !== '' ? $att['cra_original_name'] : 'Anexo'),
                    'category' => $hideDetails ? 'other' : (string) ($att['cra_category'] ?? 'other'),
                    'size'     => $hideDetails ? 0 : (int) ($att['cra_file_size'] ?? 0),
                ];
            }
        }

        $items = array_map(static fn ($row) => [
            'id'              => (int) $row['id'],
            'content'         => (string) ($row['cm_content'] ?? ''),
            'user_manager_id' => (int) ($row['cm_user_manager_id'] ?? 0),
            'author'          => (string) (($row['uc_name'] ?? '') !== '' ? $row['uc_name'] : ($row['um_username'] ?? '')),
            'created_at'      => (string) ($row['created_at'] ?? ''),
            'attachments'     => $attachmentsByMessage[(int) $row['id']] ?? [],
        ], array_reverse($rows));

        // Menções (quem foi marcado em cada mensagem) e membros ativos da sala (para o @).
        $mentionsByMessage = [];
        if ($messageIds !== []) {
            $mentionRows = $this->mentionsModel
                ->select('chat_message_mentions.chat_message_id, chat_message_mentions.user_manager_id, user_profiles.name AS user_name, user_manager.username AS username')
                ->join('user_manager', 'user_manager.id = chat_message_mentions.user_manager_id', 'left')
                ->join('user_profiles', 'user_profiles.user_manager_id = user_manager.id AND user_profiles.deleted_at IS NULL', 'left')
                ->whereIn('chat_message_mentions.chat_message_id', $messageIds)
                ->findAll();

            foreach ($mentionRows as $row) {
                $mentionsByMessage[(int) $row['chat_message_id']][] = [
                    'user_manager_id' => (int) $row['user_manager_id'],
                    'name'            => (string) (($row['user_name'] ?? '') !== '' ? $row['user_name'] : ($row['username'] ?? '')),
                ];
            }
        }

        foreach ($items as &$item) {
            $item['mentions'] = $mentionsByMessage[$item['id']] ?? [];
        }
        unset($item);

        $memberRows = $this->membersModel
            ->select('chat_room_members.id AS membership_id, chat_room_members.user_manager_id, user_profiles.name AS user_name, user_manager.username AS username')
            ->join('user_manager', 'user_manager.id = chat_room_members.user_manager_id', 'left')
            ->join('user_profiles', 'user_profiles.user_manager_id = user_manager.id AND user_profiles.deleted_at IS NULL', 'left')
            ->where('chat_room_members.chat_rooms_manager_id', $roomId)
            ->where('chat_room_members.status', 'active')
            ->orderBy('user_profiles.name', 'ASC')
            ->findAll();

        $members = array_map(static fn ($row) => [
            'membership_id'   => (int) $row['membership_id'],
            'user_manager_id' => (int) $row['user_manager_id'],
            'name'            => (string) (($row['user_name'] ?? '') !== '' ? $row['user_name'] : ($row['username'] ?? '')),
        ], $memberRows);

        return ['success' => true, 'data' => ['items' => $items, 'count' => count($items), 'members' => $members]];
    }

    private function isActiveMember(int $roomId, int $userId): bool
    {
        return $this->membersModel
            ->where('chat_rooms_manager_id', $roomId)
            ->where('user_manager_id', $userId)
            ->where('status', 'active')
            ->first() !== null;
    }

    private function forbidden(string $message = 'Operacao nao permitida para este usuario'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 403];
    }

    private function notFound(string $message = 'Registro nao encontrado ou foi excluido'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 404];
    }

    private function conflict(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 409];
    }
}
