<?php

namespace App\Services\V1\User\UserProfiles;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\User\UserProfiles\SqlTableModel;
use App\Services\V1\BaseTableService;
use Config\Database;

/**
 * Service de negócio para o módulo UserProfiles.
 *
 * Toda a lógica genérica (leitura, escrita, exclusão) está em BaseTableService.
 * Este Processor valida a existência de user_manager_id (FK -> user_manager.id)
 * e a unicidade de email; update() restringe não-admin ao próprio registro
 * (user_manager_id = CurrentUser::id()) — mesmo padrão de
 * Services\V1\Calendar\CalendarEvents\Processor::update(), necessário porque
 * a tela "Editar Perfil" (self-service) expõe este endpoint ao usuário final.
 *
 * Métodos: find, getGrouped, search, get, getAll, getNoPagination,
 *          getDeleted, getDeletedAll, create, update,
 *          deleteSoft, deleteRestore, deleteHard, clearDeleted
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
    }

    /**
     * Perfil (user_profiles) do usuário logado, buscado por user_manager_id —
     * usado pelo endpoint GET .../me (self-service, sem depender do id do
     * registro, que o front não tem motivo pra conhecer previamente).
     */
    public function getMine(): ?array
    {
        return $this->tableModel->findByUserManagerId((int) CurrentUser::id());
    }

    /**
     * PUT .../update/{id} — admin edita qualquer registro; demais perfis só
     * editam o próprio (user_manager_id = CurrentUser::id()) e não podem
     * transferir a posse do perfil para outro usuário.
     */
    public function update(int $id, array $data): array
    {
        if (!CurrentUser::isAdmin()) {
            $existing = $this->tableModel->find($id);
            if ($existing === null || (int) ($existing['user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
                return ['success' => false, 'message' => 'Registro não encontrado ou foi excluído', 'code' => 404];
            }
            unset($data['user_manager_id']);
        }

        return parent::update($id, $data);
    }

    // -------------------------------------------------------------------------
    // Hooks de validação
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        if (!empty($data['user_manager_id']) && !$this->userManagerExiste((int) $data['user_manager_id'])) {
            return ['success' => false, 'message' => 'user_manager_id não encontrado em user_manager', 'code' => 422];
        }

        if (!empty($data['email']) && $this->tableModel->existsByEmail($data['email'])) {
            return ['success' => false, 'message' => 'Email já cadastrado', 'code' => 409];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (!empty($data['user_manager_id']) && !$this->userManagerExiste((int) $data['user_manager_id'])) {
            return ['success' => false, 'message' => 'user_manager_id não encontrado em user_manager', 'code' => 422];
        }

        if (!empty($data['email']) && $this->tableModel->existsByEmail($data['email'], $id)) {
            return ['success' => false, 'message' => 'Email já cadastrado', 'code' => 409];
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Helpers — user_manager_id (FK -> user_manager.id)
    // -------------------------------------------------------------------------

    /** Existe um user_manager ativo (deleted_at IS NULL) com esse id? */
    private function userManagerExiste(int $id): bool
    {
        return Database::connect(DB_GROUP_001)
            ->table('user_manager')
            ->where('id', $id)
            ->where('deleted_at', null)
            ->countAllResults() > 0;
    }
}
