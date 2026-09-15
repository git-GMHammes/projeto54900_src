<?php

namespace App\Services\V1\User\UserManager;

use App\Models\V1\User\UserManager\SqlTableModel;
use App\Models\V1\User\UserManager\SqlViewModel;
use App\Services\V1\BaseTableService;
use Config\Database;

/**
 * Service de negócio para o módulo UserManager.
 *
 * Toda a lógica genérica (leitura, escrita, exclusão) está em BaseTableService.
 * Este Processor valida unicidade de username, aplica bcrypt na senha, valida
 * user_role_id como FK ativa de user_roles.id (422) e normaliza user_role_id
 * vazio para NULL.
 *
 * Métodos: find, getGrouped, search, get, getAll, getNoPagination,
 *          getDeleted, getDeletedAll, create, update,
 *          deleteSoft, deleteRestore, deleteHard, clearDeleted
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel  $viewModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validação
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        if (!empty($data['username']) && $this->tableModel->existsByUsername($data['username'])) {
            return ['success' => false, 'message' => 'Username já cadastrado', 'code' => 409];
        }

        if ($this->userRoleInformado($data) && !$this->userRoleExiste((int) $data['user_role_id'])) {
            return ['success' => false, 'message' => 'user_role_id não encontrado em user_roles', 'code' => 422];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (!empty($data['username']) && $this->tableModel->existsByUsername($data['username'], $id)) {
            return ['success' => false, 'message' => 'Username já cadastrado', 'code' => 409];
        }

        if ($this->userRoleInformado($data) && !$this->userRoleExiste((int) $data['user_role_id'])) {
            return ['success' => false, 'message' => 'user_role_id não encontrado em user_roles', 'code' => 422];
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Hook de preparação de dados
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        if (!empty($data['password_hash'])) {
            $data['password_hash'] = password_hash($data['password_hash'], PASSWORD_BCRYPT);
        }

        // status nunca é definido pelo cliente no create — o DEFAULT da coluna
        // no banco ('active') decide o status de todo novo usuário.
        unset($data['status']);

        return $this->normalizeUserRole($data);
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        if (!empty($data['password_hash'])) {
            $data['password_hash'] = password_hash($data['password_hash'], PASSWORD_BCRYPT);
        } else {
            unset($data['password_hash']);
        }

        return $this->normalizeUserRole($data);
    }

    // -------------------------------------------------------------------------
    // Helpers — user_role_id (FK -> user_roles.id)
    // -------------------------------------------------------------------------

    /**
     * user_role_id vazio ('' ou 0) vira NULL — limpa o vínculo com user_roles.
     * Quando presente e válido, é normalizado para int.
     */
    private function normalizeUserRole(array $data): array
    {
        if (!array_key_exists('user_role_id', $data)) {
            return $data;
        }

        $valor = $data['user_role_id'];
        $data['user_role_id'] = ($valor === null || $valor === '' || (int) $valor < 1)
            ? null
            : (int) $valor;

        return $data;
    }

    /** true quando user_role_id veio no payload com um id > 0. */
    private function userRoleInformado(array $data): bool
    {
        return array_key_exists('user_role_id', $data)
            && $data['user_role_id'] !== null
            && $data['user_role_id'] !== ''
            && (int) $data['user_role_id'] > 0;
    }

    /** Existe um user_roles ativo (deleted_at IS NULL) com esse id? */
    private function userRoleExiste(int $id): bool
    {
        return Database::connect(DB_GROUP_001)
            ->table('user_roles')
            ->where('id', $id)
            ->where('deleted_at', null)
            ->countAllResults() > 0;
    }
}
