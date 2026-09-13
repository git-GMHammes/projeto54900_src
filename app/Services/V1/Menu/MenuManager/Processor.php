<?php

namespace App\Services\V1\Menu\MenuManager;

use App\Models\V1\Menu\MenuManager\SqlTableModel;
use App\Models\V1\Nav\NavManager\SqlTableModel as NavManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Menu/MenuManager.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - valida a existencia do nav_manager_id (FK ativa)
 *  - valida a existencia do parent_id (FK ativa) e garante que o item pai
 *    pertence ao mesmo nav_manager_id (evita submenu ligado a outro nav)
 *  - serializa o campo JSON (roles) quando chega como array
 *  - garante que status nunca seja definido pelo cliente no create
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    private NavManagerModel $navManagerModel;

    private const JSON_COLUMNS = [
        'roles',
    ];

    public function __construct()
    {
        $this->tableModel      = new SqlTableModel();
        $this->navManagerModel = new NavManagerModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $navManagerId = (int) ($data['nav_manager_id'] ?? 0);

        if ($navManagerId < 1 || !$this->navManagerModel->find($navManagerId)) {
            return ['success' => false, 'message' => 'nav_manager_id nao encontrado', 'code' => 422];
        }

        if (!empty($data['parent_id'])) {
            $erro = $this->validarParentId((int) $data['parent_id'], $navManagerId);
            if ($erro !== null) {
                return $erro;
            }
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $current = $this->tableModel->find($id);
        if (!$current) {
            return null; // inexistencia e tratada por BaseTableService::update
        }

        $navManagerId = (int) ($data['nav_manager_id'] ?? $current['nav_manager_id']);

        if (array_key_exists('nav_manager_id', $data) && (!$navManagerId || !$this->navManagerModel->find($navManagerId))) {
            return ['success' => false, 'message' => 'nav_manager_id nao encontrado', 'code' => 422];
        }

        if (array_key_exists('parent_id', $data) && !empty($data['parent_id'])) {
            $erro = $this->validarParentId((int) $data['parent_id'], $navManagerId, $id);
            if ($erro !== null) {
                return $erro;
            }
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Hooks de preparacao de dados
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        // status nunca e definido pelo cliente no create - o DEFAULT da coluna
        // ('draft') decide o status de todo novo item de menu.
        unset($data['status']);

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

    // -------------------------------------------------------------------------
    // Helpers — parent_id (FK -> menu_manager.id, self)
    // -------------------------------------------------------------------------

    /**
     * Valida que parent_id existe e pertence ao mesmo nav_manager_id do item
     * sendo criado/atualizado. $excludeId evita que um item vire pai de si mesmo.
     */
    private function validarParentId(int $parentId, int $navManagerId, ?int $excludeId = null): ?array
    {
        if ($excludeId !== null && $parentId === $excludeId) {
            return ['success' => false, 'message' => 'parent_id nao pode ser o proprio item', 'code' => 422];
        }

        $pai = $this->tableModel->find($parentId);

        if (!$pai) {
            return ['success' => false, 'message' => 'parent_id nao encontrado', 'code' => 422];
        }

        if ((int) $pai['nav_manager_id'] !== $navManagerId) {
            return ['success' => false, 'message' => 'parent_id pertence a outro nav_manager_id', 'code' => 422];
        }

        return null;
    }
}
