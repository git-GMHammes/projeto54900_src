<?php

namespace App\Services\V1\Template\TempManager;

use App\Models\V1\Template\TempManager\SqlTableModel;
use App\Services\V1\BaseTableService;
use App\Services\V1\Template\CompanyManagerColumn;

/**
 * Service de negocio do modulo Template/TempManager (catalogo de templates).
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - garante code unico (409) e imutavel depois de criado (422)
 *  - valida/normaliza company_manager (slugs existentes; a lista PODE ser vazia e,
 *    no create, nao assume a empresa da sessao: o catalogo e global)
 *  - uma empresa pode estar em varios templates; o padrao dela e o de menor id ativo e
 *    cada usuario pode escolher o seu (user_manager.temp_manager_id)
 *  - garante que status nunca seja definido pelo cliente no create (nasce 'draft')
 *
 * Acesso exclusivo do superuser (filtro 'superuseronly' em Config/Filters.php).
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

    protected function companyManagerAllowsEmpty(): bool
    {
        return true;
    }

    protected function companyManagerDefaultsToSession(): bool
    {
        return false;
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $code = trim((string) ($data['code'] ?? ''));

        if ($code !== '' && $this->tableModel->existsByField('code', $code)) {
            return ['success' => false, 'message' => 'Ja existe um template com este code', 'code' => 409];
        }

        $erro = $this->validateCompanyManager($data, true);
        if ($erro !== null) {
            return $erro;
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $atual = $this->tableModel->find($id);
        if (!$atual) {
            return null; // inexistencia e tratada por BaseTableService::update
        }

        if (array_key_exists('code', $data) && trim((string) $data['code']) !== (string) $atual['code']) {
            return ['success' => false, 'message' => 'O code do template nao pode ser alterado', 'code' => 422];
        }

        $erro = $this->validateCompanyManager($data, false);
        if ($erro !== null) {
            return $erro;
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Hooks de preparacao de dados
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        // status nunca e definido pelo cliente no create - nasce 'draft'; a ativacao e um update.
        unset($data['status']);

        return $this->prepareCompanyManager($data, true);
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['code']);

        return $this->prepareCompanyManager($data, false);
    }
}
