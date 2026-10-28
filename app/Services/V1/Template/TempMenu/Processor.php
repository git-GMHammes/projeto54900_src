<?php

namespace App\Services\V1\Template\TempMenu;

use App\Models\V1\Template\TempMenu\SqlTableModel;
use App\Models\V1\Template\TempNav\SqlTableModel as TempNavModel;
use App\Services\V1\BaseTableService;
use App\Services\V1\Template\CompanyManagerColumn;

/**
 * Service de negocio do modulo Template/TempMenu.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - valida a existencia do temp_nav_id (FK ativa)
 *  - valida a existencia do parent_id (FK ativa) e garante que o item pai
 *    pertence ao mesmo temp_nav_id (evita submenu ligado a outro nav)
 *  - serializa o campo JSON (roles) quando chega como array
 *  - valida e normaliza company_manager (lista JSON de empresas; padrao: empresa da sessao)
 *  - garante que status nunca seja definido pelo cliente no create
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    use CompanyManagerColumn;

    protected SqlTableModel $tableModel;
    private TempNavModel $tempNavModel;

    private const JSON_COLUMNS = [
        'roles',
    ];

    public function __construct()
    {
        $this->tableModel      = new SqlTableModel();
        $this->tempNavModel = new TempNavModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $tempNavId = (int) ($data['temp_nav_id'] ?? 0);

        if ($tempNavId < 1 || !$this->tempNavModel->find($tempNavId)) {
            return ['success' => false, 'message' => 'temp_nav_id nao encontrado', 'code' => 422];
        }

        if (!empty($data['parent_id'])) {
            $erro = $this->validarParentId((int) $data['parent_id'], $tempNavId);
            if ($erro !== null) {
                return $erro;
            }
        }

        return $this->validateCompanyManager($data, true);
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $current = $this->tableModel->find($id);
        if (!$current) {
            return null; // inexistencia e tratada por BaseTableService::update
        }

        $erroEmpresa = $this->validateCompanyManager($data, false);
        if ($erroEmpresa !== null) {
            return $erroEmpresa;
        }

        $tempNavId = (int) ($data['temp_nav_id'] ?? $current['temp_nav_id']);

        if (array_key_exists('temp_nav_id', $data) && (!$tempNavId || !$this->tempNavModel->find($tempNavId))) {
            return ['success' => false, 'message' => 'temp_nav_id nao encontrado', 'code' => 422];
        }

        if (array_key_exists('parent_id', $data) && !empty($data['parent_id'])) {
            $erro = $this->validarParentId((int) $data['parent_id'], $tempNavId, $id);
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

        return $this->encodeJsonColumns($this->prepareCompanyManager($data, true));
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        return $this->encodeJsonColumns($this->prepareCompanyManager($data, false));
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
    // Helpers — parent_id (FK -> temp_menu.id, self)
    // -------------------------------------------------------------------------

    /**
     * Valida que parent_id existe e pertence ao mesmo temp_nav_id do item
     * sendo criado/atualizado. $excludeId evita que um item vire pai de si mesmo.
     */
    private function validarParentId(int $parentId, int $tempNavId, ?int $excludeId = null): ?array
    {
        if ($excludeId !== null && $parentId === $excludeId) {
            return ['success' => false, 'message' => 'parent_id nao pode ser o proprio item', 'code' => 422];
        }

        $pai = $this->tableModel->find($parentId);

        if (!$pai) {
            return ['success' => false, 'message' => 'parent_id nao encontrado', 'code' => 422];
        }

        if ((int) $pai['temp_nav_id'] !== $tempNavId) {
            return ['success' => false, 'message' => 'parent_id pertence a outro temp_nav_id', 'code' => 422];
        }

        return null;
    }
}
