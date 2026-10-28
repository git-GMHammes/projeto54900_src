<?php

namespace App\Services\V1\Template\TempNav;

use App\Models\V1\Template\TempNav\SqlTableModel;
use App\Services\V1\BaseTableService;
use App\Services\V1\Template\CompanyManagerColumn;

/**
 * Service de negocio do modulo Template/TempNav.
 *
 * CRUD generico vem de BaseTableService. Este Processor apenas garante que
 * o status nunca seja definido pelo cliente no create (nasce do DEFAULT da
 * coluna, 'draft') e valida/normaliza company_manager (lista JSON de empresas;
 * padrao: empresa da sessao).
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    use CompanyManagerColumn;

    protected SqlTableModel $tableModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        return $this->validateCompanyManager($data, true);
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        return $this->validateCompanyManager($data, false);
    }

    // -------------------------------------------------------------------------
    // Hooks de preparacao de dados
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        // status nunca e definido pelo cliente no create - o DEFAULT da coluna
        // ('draft') decide o status de toda nova config de nav.
        unset($data['status']);

        return $this->prepareCompanyManager($data, true);
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        return $this->prepareCompanyManager($data, false);
    }
}
