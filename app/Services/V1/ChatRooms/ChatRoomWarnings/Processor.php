<?php

namespace App\Services\V1\ChatRooms\ChatRoomWarnings;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\ChatRooms\ChatMessages\SqlTableModel as ChatMessagesModel;
use App\Models\V1\ChatRooms\ChatRoomsManager\SqlTableModel as ChatRoomsManagerModel;
use App\Models\V1\ChatRooms\ChatRoomWarnings\SqlTableModel;
use App\Models\V1\ChatRooms\ChatRoomWarnings\SqlViewModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo ChatRooms/ChatRoomWarnings — advertencia de
 * palavrao.
 *
 * Regras (README_modulo_chatrooms.md §4.5): nao ha "autor" de uma
 * advertencia — e registro de moderacao sobre outro usuario (revela ate a
 * palavra proibida usada), por isso o modulo inteiro (27 rotas) e adminonly
 * na propria rota. A criacao automatica pelo filtro de palavrao continua
 * fora de escopo aqui: o dicionario JSON estatico ainda nao existe (mesma
 * pendencia documentada em ChatMessages/Processor); quando existir, deve
 * inserir direto via SqlTableModel::insert(), sem passar por este Processor
 * (mesmo padrao ja usado em ChatRoomAttachmentReports para chat_room_members).
 *
 *  - Sala, usuario e mensagem precisam existir (404 cada).
 *  - A mensagem precisa pertencer a sala informada (409 se nao pertencer).
 *  - Vinculos (sala/usuario/mensagem) sao imutaveis apos criados; so
 *    flagged_word e editavel.
 *  - Todo write (create/update/delete-*) e so admin — a rota ja barra com
 *    adminonly, o Processor reconfere (defesa em profundidade).
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private ChatRoomsManagerModel $roomsModel;
    private ChatMessagesModel $messagesModel;
    private UserManagerModel $usersModel;

    public function __construct()
    {
        $this->tableModel    = new SqlTableModel();
        $this->viewModel     = new SqlViewModel();
        $this->roomsModel    = new ChatRoomsManagerModel();
        $this->messagesModel = new ChatMessagesModel();
        $this->usersModel    = new UserManagerModel();
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $roomId = (int) ($data['chat_rooms_manager_id'] ?? 0);

        if ($this->roomsModel->find($roomId) === null) {
            return $this->notFound('Sala nao encontrada');
        }

        $userId = (int) ($data['user_manager_id'] ?? 0);

        if ($this->usersModel->find($userId) === null) {
            return $this->notFound('Usuario advertido nao encontrado');
        }

        $messageId = (int) ($data['chat_message_id'] ?? 0);
        $message   = $this->messagesModel->find($messageId);

        if ($message === null) {
            return $this->notFound('Mensagem nao encontrada');
        }

        if ((int) ($message['chat_rooms_manager_id'] ?? 0) !== $roomId) {
            return $this->conflict('A mensagem informada e de outra sala');
        }

        return null;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['chat_rooms_manager_id'], $data['user_manager_id'], $data['chat_message_id']);

        return $data;
    }

    // -------------------------------------------------------------------------
    // Escrita — so admin
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode registrar advertencias');
        }

        return parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode editar advertencias');
        }

        return parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode excluir advertencias');
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode restaurar advertencias');
        }

        return parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode excluir advertencias definitivamente');
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
