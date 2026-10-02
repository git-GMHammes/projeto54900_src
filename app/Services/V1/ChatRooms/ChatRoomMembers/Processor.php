<?php

namespace App\Services\V1\ChatRooms\ChatRoomMembers;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\ChatRooms\ChatRoomMembers\SqlTableModel;
use App\Models\V1\ChatRooms\ChatRoomMembers\SqlViewModel;
use App\Models\V1\ChatRooms\ChatRoomsManager\SqlTableModel as ChatRoomsManagerModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo ChatRooms/ChatRoomMembers — quem esta na sala.
 *
 * Regras (README_modulo_chatrooms.md §2.2/§4):
 *  - Guest nao escreve (403).
 *  - Escrita (create/update/delete) so do dono da sala (ou admin): e o
 *    moderador que adiciona, bloqueia e remove membros. Quem nao e dono
 *    recebe 403; matricula/sala inexistente -> 404.
 *  - Matricula unica por sala+usuario (UNIQUE chat_rooms_manager_id +
 *    user_manager_id): se o par ja existe ativo -> 409; se esta
 *    soft-deleted, o create restaura e reaplica os dados.
 *  - Sala e usuario sao imutaveis apos o create.
 *  - status=blocked grava blocked_at (e blocked_reason=manual se nao vier
 *    motivo); status diferente de blocked limpa blocked_at/blocked_reason.
 *  - clear-deleted e so admin (defesa em profundidade — a rota ja tem
 *    filtro adminonly).
 *  - Fechar a sala ao atingir 3 bloqueados e a auto-entrada do membro na
 *    primeira interacao seguem como integracao futura (§7) — fora de
 *    escopo aqui.
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

    protected function prepareData(array $data): array
    {
        unset($data['blocked_at']);

        return $this->applyBlockedFields($data, null);
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['chat_rooms_manager_id'], $data['user_manager_id'], $data['blocked_at']);

        $current = $this->tableModel->find($id);

        return $this->applyBlockedFields($data, $current['status'] ?? null);
    }

    // -------------------------------------------------------------------------
    // Escrita — sempre do dono da sala (ou admin)
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $roomId = (int) ($data['chat_rooms_manager_id'] ?? 0);
        $userId = (int) ($data['user_manager_id'] ?? 0);

        $room = $this->roomsModel->find($roomId);
        if ($room === null) {
            return $this->notFound('Sala nao encontrada');
        }

        if (!CurrentUser::isAdmin() && (int) ($room['owner_user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return $this->forbidden('Somente o dono da sala pode adicionar membros');
        }

        if ($this->usersModel->find($userId) === null) {
            return $this->notFound('Usuario nao encontrado');
        }

        $existing = $this->tableModel->withDeleted()
            ->where('chat_rooms_manager_id', $roomId)
            ->where('user_manager_id', $userId)
            ->first();

        if ($existing !== null) {
            $existing = (array) $existing;

            if (($existing['deleted_at'] ?? null) === null) {
                return ['success' => false, 'message' => 'Usuario ja e membro desta sala', 'code' => 409];
            }

            // Matricula excluida: restaura e reaplica os dados enviados.
            $id = (int) $existing['id'];
            $this->tableModel->restore($id);

            return parent::update($id, $data);
        }

        return parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertRoomOwner($id);
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

        $guarded = $this->assertRoomOwner($id);
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

        $guarded = $this->assertRoomOwner($id, true);
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

        $guarded = $this->assertRoomOwner($id, true);
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

    /**
     * Aplica a regra de blocked_at/blocked_reason a partir do status. Em
     * update, so mexe quando o status esta presente e muda de fato.
     */
    private function applyBlockedFields(array $data, ?string $currentStatus): array
    {
        if (!array_key_exists('status', $data) || ($data['status'] === '' || $data['status'] === null)) {
            return $data;
        }

        if ($data['status'] === 'blocked') {
            if ($currentStatus !== 'blocked') {
                $data['blocked_at'] = date('Y-m-d H:i:s');
            }
            if (empty($data['blocked_reason'])) {
                $data['blocked_reason'] = 'manual';
            }
        } else {
            $data['blocked_at']     = null;
            $data['blocked_reason'] = null;
        }

        return $data;
    }

    private function assertRoomOwner(int $id, bool $includeDeleted = false): ?array
    {
        $existing = $includeDeleted
            ? $this->tableModel->findWithDeleted($id)
            : $this->tableModel->find($id);

        if ($existing === null) {
            return $this->notFound();
        }

        if (CurrentUser::isAdmin()) {
            return null;
        }

        $room = $this->roomsModel->withDeleted()->find((int) ($existing['chat_rooms_manager_id'] ?? 0));

        if ($room === null || (int) ($room['owner_user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return $this->forbidden('Somente o dono da sala pode alterar ou excluir membros');
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
