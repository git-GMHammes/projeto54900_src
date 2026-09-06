<?php

namespace App\Controllers\Api\V1;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

// Documentação detalhada desta classe: src/app/markdown/ROADMAP_BaseResourceViewController.md

/**
 * Controller base para recursos somente leitura via View na API V1.
 *
 * Fornece os 8 endpoints REST de leitura sobre uma view SQL:
 *   find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getDeletedAll
 *
 * Views não sofrem operações de escrita ou exclusão direta —
 * essas responsabilidades pertencem ao ResourceTableController do módulo.
 *
 * Os controllers específicos de cada módulo devem herdar desta classe
 * e declarar $this->processor no initController.
 */
abstract class BaseResourceViewController extends BaseResourceTableController
{
    public function initController(
        RequestInterface $request,
        ResponseInterface $response,
        LoggerInterface $logger
    ): void {
        parent::initController($request, $response, $logger);
    }

    // -------------------------------------------------------------------------
    // Hooks não aplicáveis em views — sem create/update direto
    // -------------------------------------------------------------------------

    final protected function getCreateRules(): array
    {
        return [];
    }
    final protected function getUpdateRules(): array
    {
        return [];
    }

    // -------------------------------------------------------------------------
    // Endpoints de leitura (view)
    // -------------------------------------------------------------------------

    /**
     * POST .../find?page=1&limit=20&sort=id&order=desc
     *
     * Body JSON: { "campo": "valor" }
     * Cada chave é um campo da view; cada valor é um escalar para WHERE exato.
     */
    public function find(): ResponseInterface
    {
        try {
            $body = $this->getJsonBody();
            $filters = $this->extractRequestFilters($body);

            $result = $this->processor->findView($filters, $this->getPaginationParams());

            return $this->respondPaginated($result['data'], $result['pagination']);
        } catch (\InvalidArgumentException $e) {
            return $this->respondValidationError(['filters' => $e->getMessage()]);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * POST .../get-grouped?page=1&limit=20&sort=id&order=desc
     *
     * Body JSON: { "coluna": ["valor1", "valor2"] }
     * Cada chave é um campo da view; cada valor é um array de strings aceitas.
     * Retorna todos os registros correspondentes via WHERE IN — sem GROUP BY.
     */
    public function getGrouped(): ResponseInterface
    {
        try {
            $body = $this->getJsonBody();

            if (empty($body) || !\is_array($body)) {
                return $this->respondValidationError(['body' => 'O corpo da requisição deve ser um objeto JSON com ao menos um filtro']);
            }

            $multiFilters = [];
            foreach ($body as $field => $values) {
                if (\is_array($values) && !empty($values)) {
                    $multiFilters[$field] = $values;
                }
            }

            if (empty($multiFilters)) {
                return $this->respondValidationError(['body' => 'Cada filtro deve conter um array não vazio de valores']);
            }

            $result = $this->processor->getGroupedView($multiFilters, $this->getPaginationParams());

            return $this->respondPaginated($result['data'], $result['pagination'], 'Registros listados com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * GET .../search?q=termo&page=1&limit=20&sort=id&order=desc
     */
    public function search(): ResponseInterface
    {
        try {
            $term = trim((string) ($this->request->getGet('q') ?? ''));
            $result = $this->processor->searchView($term, $this->getPaginationParams());

            return $this->respondPaginated($result['data'], $result['pagination']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * GET .../get/{id}
     */
    public function get(int $id): ResponseInterface
    {
        try {
            $record = $this->processor->getView($id);

            if (!$record) {
                return $this->respondNotFound('Registro não encontrado ou foi excluído');
            }

            return $this->respondSuccess($record, 'Registro encontrado com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * GET .../get-all?page=1&limit=20&sort=id&order=desc
     */
    public function getAll(): ResponseInterface
    {
        try {
            $result = $this->processor->getAllView($this->getPaginationParams());

            return $this->respondPaginated($result['data'], $result['pagination']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * GET .../get-no-pagination?sort=id&order=desc&limit=1000
     *
     * limit é opcional: se informado (inteiro >= 1), aplica LIMIT no SQL.
     * Sem limit, retorna todos os registros (comportamento original).
     */
    public function getNoPagination(): ResponseInterface
    {
        try {
            $sort  = trim((string) ($this->request->getGet('sort') ?? 'id'));
            $order = trim((string) ($this->request->getGet('order') ?? 'desc'));
            $raw   = $this->request->getGet('limit');
            $limit = ($raw !== null && (int) $raw >= 1) ? (int) $raw : null;

            $data = $this->processor->getNoPaginationView($sort, $order, $limit);

            return $this->respondSuccess($data);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * GET .../get-deleted/{id}
     */
    public function getDeleted(int $id): ResponseInterface
    {
        try {
            $record = $this->processor->getDeletedView($id);

            if (!$record) {
                return $this->respondNotFound('Registro deletado não encontrado');
            }

            return $this->respondSuccess($record, 'Registro deletado encontrado com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * GET .../get-deleted-all?page=1&limit=20&sort=id&order=desc
     */
    public function getDeletedAll(): ResponseInterface
    {
        try {
            $result = $this->processor->getDeletedAllView($this->getPaginationParams());

            return $this->respondPaginated($result['data'], $result['pagination'], 'Registros deletados listados com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * GET .../get-all-with-deleted?page=1&limit=20&sort=id&order=desc
     */
    public function getAllWithDeleted(?int $id = null): ResponseInterface
    {
        try {
            $result = $this->processor->getAllWithDeletedView($this->getPaginationParams());

            return $this->respondPaginated($result['data'], $result['pagination'], 'Registros listados com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }
}
