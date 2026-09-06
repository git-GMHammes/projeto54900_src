<?php

namespace App\Services\V1;

use CodeIgniter\Database\Exceptions\DatabaseException;

/**
 * Service base para módulos com tabela física na API V1.
 *
 * Estende BaseViewService, herdando todos os utilitários e métodos de view.
 * Adiciona leitura de tabela, escrita (create/update via Template Method) e exclusão.
 *
 * Os Processors de módulos com tabela devem herdar desta classe, declarar
 * $this->tableModel no construtor e, se houver view, declarar $this->viewModel.
 * Sobrescrever os hooks de validação e preparação de dados quando necessário.
 *
 * @property \App\Models\V1\BaseTableModel $tableModel Model da tabela física
 * @property object                        $viewModel  Model da view (somente leitura)
 */
abstract class BaseTableService extends BaseViewService
{
    // -------------------------------------------------------------------------
    // Leitura — Tabela
    // -------------------------------------------------------------------------

    /**
     * POST /find — Consulta paginada com filtros dinâmicos (tabela).
     *
     * @param array $filters Mapa [campo => valor]
     * @param array $params  Parâmetros de paginação: page, limit, sort, order
     */
    public function find(array $filters, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findPaginated(
            $this->removeMasks($filters),
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }

    /**
     * POST /get-grouped — Listagem filtrada paginada com filtros multivalorados (tabela).
     *
     * @param array $multiFilters Mapa [campo => array_de_valores]
     * @param array $params       Parâmetros de paginação
     */
    public function getGrouped(array $multiFilters, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findGrouped(
            $this->removeMasks($multiFilters),
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }

    /**
     * GET /search — Busca textual paginada (tabela).
     *
     * @param string $term   Termo pesquisado
     * @param array  $params Parâmetros de paginação
     */
    public function search(string $term, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->tableModel->searchByTerm(
            $term,
            $this->tableModel->searchFields,
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }

    /**
     * GET /get/{id} — Busca registro ativo pelo ID (tabela).
     */
    public function get(int $id): ?array
    {
        return $this->tableModel->find($id);
    }

    /**
     * GET /get-all — Lista paginada de registros ativos (tabela).
     */
    public function getAll(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findPaginated(
            [],
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }

    /**
     * GET /get-no-pagination — Lista registros ativos sem paginação (tabela).
     * Se $limit for informado (>= 1), aplica LIMIT no SQL; caso contrário retorna tudo.
     */
    public function getNoPagination(string $sort, string $order, ?int $limit = null): array
    {
        return $this->tableModel->getOrdered($sort, $order, $limit);
    }

    /**
     * GET /get-deleted/{id} — Busca registro soft-deleted pelo ID (tabela).
     */
    public function getDeleted(int $id): ?array
    {
        return $this->tableModel->findOnlyDeleted($id);
    }

    /**
     * GET /get-with-deleted/{id} — Busca registro pelo ID, ativo ou soft-deleted.
     */
    public function getWithDeleted(int $id): ?array
    {
        return $this->tableModel->findWithDeleted($id);
    }

    /**
     * GET /get-deleted-all — Lista paginada de registros soft-deleted (tabela).
     */
    public function getDeletedAll(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findDeletedPaginated(
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }

    /**
     * GET /get-all-with-deleted/{id} — Busca registro pelo ID, ativo ou soft-deleted.
     * GET /get-all-with-deleted      — Lista paginada de todos os registros (ativos + soft-deleted).
     */
    public function getAllWithDeleted(?int $id, array $params): mixed
    {
        if ($id !== null) {
            return $this->tableModel->findWithDeleted($id);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findAllWithDeletedPaginated(
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }

    // -------------------------------------------------------------------------
    // Escrita — Template Method
    // -------------------------------------------------------------------------

    /**
     * POST /create — Sanitiza, valida, prepara e insere.
     *
     * Fluxo: sanitizeData + removeMasks → validateOnCreate → prepareData → insert.
     *
     * @return array{success: bool, data?: array, message?: string, code?: int}
     */
    public function create(array $data): array
    {
        $sanitized = $this->removeMasks($this->sanitizeData($data));

        $conflict = $this->validateOnCreate($sanitized);
        if ($conflict !== null) {
            return $conflict;
        }

        $sanitized = $this->prepareData($sanitized);

        try {
            $id = $this->tableModel->insert($sanitized);

            if (!$id) {
                return ['success' => false, 'message' => 'Erro ao criar registro', 'code' => 500];
            }

            return ['success' => true, 'data' => $this->tableModel->find($id)];
        } catch (DatabaseException $e) {
            log_message('error', '[' . static::class . '::create] DatabaseException: ' . $e->getMessage());

            return ['success' => false, 'message' => 'Erro ao criar registro', 'code' => 500];
        }
    }

    /**
     * PUT /update/{id} — Verifica existência, sanitiza, prepara, valida e atualiza.
     *
     * Fluxo: find → sanitizeData + removeMasks → prepareUpdateData → validateOnUpdate → update.
     *
     * @return array{success: bool, data?: array, message?: string, code?: int}
     */
    public function update(int $id, array $data): array
    {
        if (!$this->tableModel->find($id)) {
            return ['success' => false, 'message' => 'Registro não encontrado ou foi excluído', 'code' => 404];
        }

        $sanitized = $this->removeMasks($this->sanitizeData($data));
        $sanitized = $this->prepareUpdateData($id, $sanitized);

        $conflict = $this->validateOnUpdate($id, $sanitized);
        if ($conflict !== null) {
            return $conflict;
        }

        try {
            $this->tableModel->update($id, $sanitized);

            return ['success' => true, 'data' => $this->tableModel->find($id)];
        } catch (DatabaseException $e) {
            log_message('error', '[' . static::class . '::update] DatabaseException: ' . $e->getMessage());

            return ['success' => false, 'message' => 'Erro ao atualizar registro', 'code' => 500];
        }
    }

    /**
     * Hook: validações de negócio antes do insert (FK, unicidade, etc.).
     * Retorne ['success' => false, 'message' => '...', 'code' => N] em caso de conflito,
     * ou null para prosseguir.
     */
    protected function validateOnCreate(array $data): ?array
    {
        return null;
    }

    /**
     * Hook: validações de negócio antes do update (unicidade com excludeId, etc.).
     * Retorne um array de erro ou null para prosseguir.
     */
    protected function validateOnUpdate(int $id, array $data): ?array
    {
        return null;
    }

    /**
     * Hook: transformações de dados antes do insert (formatação, hash de senha, etc.).
     * Recebe os dados já sanitizados e validados.
     */
    protected function prepareData(array $data): array
    {
        return $data;
    }

    /**
     * Hook: transformações de dados antes do update.
     * Por padrão delega para prepareData. Sobrescrever para remover campos imutáveis.
     */
    protected function prepareUpdateData(int $id, array $data): array
    {
        return $this->prepareData($data);
    }

    // -------------------------------------------------------------------------
    // Exclusão
    // -------------------------------------------------------------------------

    /**
     * DELETE /delete-soft/{id} — Aplica soft delete no registro.
     */
    public function deleteSoft(int $id): array
    {
        $existing = $this->tableModel->findWithDeleted($id);

        if (!$existing) {
            return ['success' => false, 'message' => 'Registro não encontrado', 'code' => 404];
        }

        if ($existing['deleted_at'] !== null) {
            return ['success' => false, 'message' => 'Registro já está excluído logicamente', 'code' => 409];
        }

        $this->tableModel->delete($id);

        return ['success' => true, 'message' => 'Registro excluído logicamente com sucesso'];
    }

    /**
     * PATCH /delete-restore/{id} — Restaura registro soft-deleted.
     */
    public function deleteRestore(int $id): array
    {
        if (!$this->tableModel->findOnlyDeleted($id)) {
            return ['success' => false, 'message' => 'Registro deletado não encontrado', 'code' => 404];
        }

        $this->tableModel->restore($id);

        return ['success' => true, 'message' => 'Registro restaurado com sucesso'];
    }

    /**
     * DELETE /delete-hard/{id} — Remove permanentemente um registro.
     */
    public function deleteHard(int $id): array
    {
        if (!$this->tableModel->findWithDeleted($id)) {
            return ['success' => false, 'message' => 'Registro não encontrado', 'code' => 404];
        }

        $this->tableModel->delete($id, true);

        return ['success' => true, 'message' => 'Registro excluído permanentemente'];
    }

    /**
     * DELETE /clear-deleted      — Remove permanentemente todos os registros soft-deleted.
     * DELETE /clear-deleted/{id} — Remove permanentemente um registro soft-deleted específico.
     *
     * @param int|null $id ID específico (null = limpa todos)
     */
    public function clearDeleted(?int $id = null): array
    {
        return ['affected' => $this->tableModel->clearDeleted($id)];
    }
}
