<?php

namespace App\Services\V1\ChatRooms\ChatRoomFavorites;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\ChatRooms\ChatRoomFavorites\SqlTableModel;
use App\Models\V1\ChatRooms\ChatRoomFavorites\SqlViewModel;
use App\Models\V1\ChatRooms\ChatRoomsManager\SqlTableModel as ChatRoomsManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo ChatRooms/ChatRoomFavorites — sala favorita.
 *
 * Regras (README_modulo_chatrooms.md §2.7/§4.10):
 *  - Guest nao favorita (403).
 *  - A sala precisa existir -> 404.
 *  - Favorito unico (UNIQUE chat_rooms_manager_id + user_manager_id): a
 *    rede de seguranca e a UNIQUE; aqui o segundo clique do mesmo usuario
 *    NAO tenta inserir de novo — o Processor acha a linha (mesmo
 *    soft-deleted), restaura se for o caso e devolve o registro existente
 *    (idempotente, mesmo espirito do TimelinePostReactions).
 *  - Excluir/restaurar e so do dono do favorito (admin escapa).
 *  - "Sou eu que favoritei?" anexado na view_chat_rooms_manager (nota do
 *    §3 do README) e integracao futura do ChatRoomsManager/Processor — fora
 *    de escopo aqui.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private ChatRoomsManagerModel $roomsModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
        $this->roomsModel = new ChatRoomsManagerModel();
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $userId = (int) CurrentUser::id();
        $roomId = (int) ($data['chat_rooms_manager_id'] ?? 0);

        if ($this->roomsModel->find($roomId) === null) {
            return $this->notFound('Sala nao encontrada');
        }

        $existing = $this->findFavorite($roomId, $userId);

        if ($existing !== null) {
            $id = (int) $existing['id'];

            if (($existing['deleted_at'] ?? null) !== null) {
                $this->tableModel->restore($id);
            }

            return ['success' => true, 'data' => $this->tableModel->find($id)];
        }

        $data['user_manager_id'] = $userId;

        return parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertOwner($id);
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

        $guarded = $this->assertOwner($id);
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

        $guarded = $this->assertOwner($id, true);
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

        $guarded = $this->assertOwner($id, true);
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
    // Hooks
    // -------------------------------------------------------------------------

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['chat_rooms_manager_id'], $data['user_manager_id']);

        return $data;
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    private function findFavorite(int $roomId, int $userId): ?array
    {
        $row = $this->tableModel->withDeleted()
            ->where('chat_rooms_manager_id', $roomId)
            ->where('user_manager_id', $userId)
            ->first();

        return $row === null ? null : (array) $row;
    }

    private function assertOwner(int $id, bool $includeDeleted = false): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        $existing = $includeDeleted
            ? $this->tableModel->findWithDeleted($id)
            : $this->tableModel->find($id);

        if ($existing === null || (int) ($existing['user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return $this->notFound();
        }

        return null;
    }

    private function forbidden(string $message = 'Operacao nao permitida para este usuario'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 403];
    }

    private function notFound(string $message = 'Registro nao encontrado ou foi excluido'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 404];
    }
}
