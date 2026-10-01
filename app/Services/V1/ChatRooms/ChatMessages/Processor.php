<?php

namespace App\Services\V1\ChatRooms\ChatMessages;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\ChatRooms\ChatMessages\SqlTableModel;
use App\Models\V1\ChatRooms\ChatMessages\SqlViewModel;
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
 *  - Conteudo e imutavel apos criado: o unico update aceito e status=removed
 *    (o Request ja restringe isso). update/delete-* sao permitidos ao autor
 *    da mensagem, ao moderador da sala (owner_user_manager_id) ou a admin.
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

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
        $this->roomsModel = new ChatRoomsManagerModel();
        $this->usersModel = new UserManagerModel();
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
        unset($data['chat_rooms_manager_id'], $data['user_manager_id'], $data['content']);

        return $data;
    }

    // -------------------------------------------------------------------------
    // Escrita — autor, moderador da sala ou admin
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        return parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthorOrModerator($id);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::update($id, $data);
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
