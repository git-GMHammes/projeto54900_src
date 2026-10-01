<?php

namespace App\Services\V1\ChatRooms\ChatRoomAttachmentReports;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\ChatRooms\ChatMessages\SqlTableModel as ChatMessagesModel;
use App\Models\V1\ChatRooms\ChatRoomAttachmentReports\SqlTableModel;
use App\Models\V1\ChatRooms\ChatRoomAttachmentReports\SqlViewModel;
use App\Models\V1\ChatRooms\ChatRoomAttachments\SqlTableModel as ChatRoomAttachmentsModel;
use App\Models\V1\ChatRooms\ChatRoomMembers\SqlTableModel as ChatRoomMembersModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo ChatRooms/ChatRoomAttachmentReports.
 *
 * Regras (README_modulo_chatrooms.md §4.6): a denuncia de anexo e IMEDIATA —
 * diferente de timeline_post_reports (fila pendente ate um admin revisar),
 * aqui o Processor ja bloqueia o anexo e a matricula do autor do upload no
 * mesmo request do create.
 *
 *  - Guest nao denuncia (403).
 *  - Anexo precisa existir (404); reporter nao pode denunciar o proprio
 *    anexo (403 — nao ha "auto-denuncia").
 *  - "Membro ativo da sala" (texto do README) e verificado via
 *    user_manager.status='active': nao ha como confirmar matricula em
 *    chat_room_members porque a auto-entrada na sala ainda e integracao
 *    futura (mesma limitacao documentada em ChatMessages/Processor).
 *  - Uma denuncia por usuario por anexo -> 409 na segunda tentativa (UNIQUE
 *    da tabela).
 *  - Efeito imediato do create: bloqueia chat_room_attachments.status e, em
 *    melhor esforco, chat_room_members.status/blocked_reason do autor do
 *    upload (se a matricula nao existir, so o anexo e bloqueado).
 *  - status sempre nasce 'resolved'; reviewed_by/reviewed_at/review_note
 *    ficam null ate um admin editar via update (rota adminonly).
 *  - update/delete-* sao so admin (rota ja barra com adminonly, Processor
 *    reconfere). Rejeitar uma denuncia NAO desfaz os bloqueios automaticos —
 *    reversao e manual, pelos proprios endpoints do anexo/membro.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private ChatRoomAttachmentsModel $attachmentsModel;
    private ChatMessagesModel $messagesModel;
    private ChatRoomMembersModel $membersModel;
    private UserManagerModel $usersModel;

    public function __construct()
    {
        $this->tableModel       = new SqlTableModel();
        $this->viewModel        = new SqlViewModel();
        $this->attachmentsModel = new ChatRoomAttachmentsModel();
        $this->messagesModel    = new ChatMessagesModel();
        $this->membersModel     = new ChatRoomMembersModel();
        $this->usersModel       = new UserManagerModel();
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $attachmentId = (int) ($data['chat_room_attachment_id'] ?? 0);
        $attachment   = $attachmentId > 0 ? $this->attachmentsModel->find($attachmentId) : null;

        if ($attachment === null) {
            return $this->notFound('Anexo nao encontrado');
        }

        $message = $this->messagesModel->find((int) ($attachment['chat_message_id'] ?? 0));

        if ($message === null) {
            return $this->notFound('Mensagem do anexo nao encontrada');
        }

        $currentUserId = (int) CurrentUser::id();

        if ((int) ($message['user_manager_id'] ?? 0) === $currentUserId) {
            return $this->forbidden('Voce nao pode denunciar o proprio anexo');
        }

        $user = $this->usersModel->find($currentUserId);

        if ($user === null || ($user['status'] ?? null) !== 'active') {
            return $this->forbidden('Somente usuario ativo pode denunciar');
        }

        $jaDenunciou = $this->tableModel->withDeleted()
            ->where('chat_room_attachment_id', $attachmentId)
            ->where('reporter_user_manager_id', $currentUserId)
            ->first();

        if ($jaDenunciou !== null) {
            return $this->conflict('Voce ja denunciou este anexo');
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $data['reporter_user_manager_id'] = (int) CurrentUser::id();
        $data['status']                   = 'resolved';

        unset($data['reviewed_by'], $data['reviewed_at'], $data['review_note']);

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['chat_room_attachment_id'], $data['reporter_user_manager_id']);

        if (array_key_exists('status', $data) && $data['status'] !== 'pending' && empty($data['reviewed_at'])) {
            $data['reviewed_at'] = date('Y-m-d H:i:s');
            $data['reviewed_by'] = (int) CurrentUser::id();
        }

        return $data;
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $result = parent::create($data);

        if ($result['success']) {
            $this->applyImmediateBlock((int) ($result['data']['chat_room_attachment_id'] ?? 0));
            $result['data'] = $this->tableModel->find((int) $result['data']['id']);
        }

        return $result;
    }

    public function update(int $id, array $data): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode moderar denuncias');
        }

        return parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode moderar denuncias');
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode moderar denuncias');
        }

        return parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode moderar denuncias');
        }

        return parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode moderar denuncias');
        }

        return parent::clearDeleted($id);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    /**
     * README §4.6: bloqueia o anexo denunciado e, em melhor esforco, a
     * matricula do autor do upload (se a linha em chat_room_members existir).
     */
    private function applyImmediateBlock(int $attachmentId): void
    {
        $attachment = $this->attachmentsModel->find($attachmentId);

        if ($attachment === null) {
            return;
        }

        $this->attachmentsModel->update($attachmentId, ['status' => 'blocked']);

        $message = $this->messagesModel->find((int) ($attachment['chat_message_id'] ?? 0));

        if ($message === null) {
            return;
        }

        $membership = $this->membersModel->findByRoomAndUser(
            (int) ($message['chat_rooms_manager_id'] ?? 0),
            (int) ($message['user_manager_id'] ?? 0)
        );

        if ($membership === null) {
            // Auto-entrada em chat_room_members ainda e integracao futura:
            // sem matricula nao ha o que bloquear, so o anexo mesmo.
            return;
        }

        $this->membersModel->update((int) $membership['id'], [
            'status'         => 'blocked',
            'blocked_reason' => 'attachment_report',
            'blocked_at'     => date('Y-m-d H:i:s'),
        ]);
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
