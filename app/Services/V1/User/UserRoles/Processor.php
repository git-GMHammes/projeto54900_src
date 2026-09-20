<?php

namespace App\Services\V1\User\UserRoles;

use App\Models\V1\User\UserRoles\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo User/UserRoles.
 *
 * Todo o CRUD generico (leitura, escrita, exclusao) vem de BaseTableService.
 * Este Processor:
 *  - garante unicidade de slug (validateOnCreate / validateOnUpdate)
 *  - serializa o campo JSON (permissions) quando chega como array
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;

    private const JSON_COLUMNS = [
        'permissions',
    ];

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        if (!empty($data['slug']) && $this->tableModel->existsBySlug((string) $data['slug'])) {
            return ['success' => false, 'message' => 'slug ja utilizado por outro perfil', 'code' => 409];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (!empty($data['slug']) && $this->tableModel->existsBySlug((string) $data['slug'], $id)) {
            return ['success' => false, 'message' => 'slug ja utilizado por outro perfil', 'code' => 409];
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Hooks de preparacao de dados
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        return $this->encodeJsonColumns($data);
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        return $this->encodeJsonColumns($data);
    }

    /**
     * Converte para string JSON as colunas JSON recebidas como array/objeto.
     * Strings sao mantidas como vieram (assume-se JSON ja valido).
     */
    private function encodeJsonColumns(array $data): array
    {
        foreach (self::JSON_COLUMNS as $col) {
            if (isset($data[$col]) && \is_array($data[$col])) {
                $data[$col] = json_encode($data[$col], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            }
        }

        return $data;
    }
}
