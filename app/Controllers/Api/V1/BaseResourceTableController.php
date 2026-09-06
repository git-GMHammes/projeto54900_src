<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller base para os recursos de tabela da API V1.
 *
 * Fornece os endpoints REST completos (leitura + escrita + exclusão)
 * e os helpers de resposta padronizados.
 *
 * Os controllers específicos de cada módulo devem herdar desta classe,
 * declarar $this->processor no initController e implementar os dois
 * hooks abstratos de validação: getCreateRules() e getUpdateRules().
 *
 * Nenhuma lógica de negócio deve existir aqui — apenas orquestração.
 *
 * Nota: o suporte a upload de anexos do projeto de origem não foi portado
 * nesta fase (depende de FileUploadService / App\HTTP\Files).
 */
abstract class BaseResourceTableController extends BaseController
{
    protected $processor;

    /** Cache do body parseado — evita reler php://input múltiplas vezes no mesmo request. */
    private ?array $cachedRequestBody = null;

    public function initController(
        RequestInterface $request,
        ResponseInterface $response,
        LoggerInterface $logger
    ): void {
        parent::initController($request, $response, $logger);
    }

    // -------------------------------------------------------------------------
    // Hooks de validação — implementar nos controllers de cada módulo
    // -------------------------------------------------------------------------

    /**
     * Retorna as regras de validação para o endpoint create.
     * Exemplo: return (new CreateRequest())->rules();
     */
    abstract protected function getCreateRules(): array;

    /**
     * Retorna as regras de validação para o endpoint update.
     * Exemplo: return (new UpdateRequest())->rules();
     */
    abstract protected function getUpdateRules(): array;

    // -------------------------------------------------------------------------
    // Leitura
    // -------------------------------------------------------------------------

    /**
     * POST .../find?page=1&limit=20&sort=id&order=desc
     *
     * Body JSON: { "campo": "valor" }
     * Cada chave é um campo da tabela; cada valor é um escalar para WHERE exato.
     */
    public function find(): ResponseInterface
    {
        try {
            $body = $this->getJsonBody();
            $filters = $this->extractRequestFilters($body);

            $result = $this->processor->find($filters, $this->getPaginationParams());

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
     * Cada chave é um campo da tabela; cada valor é um array de strings aceitas.
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

            $result = $this->processor->getGrouped($multiFilters, $this->getPaginationParams());

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
            $result = $this->processor->search($term, $this->getPaginationParams());

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
            $record = $this->processor->get($id);

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
            $result = $this->processor->getAll($this->getPaginationParams());

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

            $data = $this->processor->getNoPagination($sort, $order, $limit);

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
            $record = $this->processor->getDeleted($id);

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
     * GET .../get-with-deleted/{id}
     *
     * Retorna o registro independente do estado (ativo ou soft-deleted).
     */
    public function getWithDeleted(int $id): ResponseInterface
    {
        try {
            $record = $this->processor->getWithDeleted($id);

            if (!$record) {
                return $this->respondNotFound('Registro não encontrado');
            }

            return $this->respondSuccess($record, 'Registro encontrado com sucesso');
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
            $result = $this->processor->getDeletedAll($this->getPaginationParams());

            return $this->respondPaginated($result['data'], $result['pagination'], 'Registros deletados listados com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * GET .../get-all-with-deleted/{id} — Busca registro pelo ID (ativo ou soft-deleted).
     * GET .../get-all-with-deleted      — Lista paginada de todos os registros (ativos + soft-deleted).
     */
    public function getAllWithDeleted(?int $id = null): ResponseInterface
    {
        try {
            if ($id !== null) {
                $record = $this->processor->getAllWithDeleted($id, []);

                if (!$record) {
                    return $this->respondNotFound('Registro não encontrado');
                }

                return $this->respondSuccess($record, 'Registro encontrado com sucesso');
            }

            $result = $this->processor->getAllWithDeleted(null, $this->getPaginationParams());

            return $this->respondPaginated($result['data'], $result['pagination'], 'Registros listados com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    /**
     * POST .../create
     */
    public function create(): ResponseInterface
    {
        try {
            if (!$this->validate($this->getCreateRules())) {
                return $this->respondValidationError($this->validator->getErrors());
            }

            $result = $this->processor->create($this->getRequestBody());

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 409);
            }

            return $this->respondCreated($result['data']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * PUT .../update/{id}
     */
    public function update(int $id): ResponseInterface
    {
        try {
            if (!$this->validate($this->getUpdateRules())) {
                return $this->respondValidationError($this->validator->getErrors());
            }

            $result = $this->processor->update($id, $this->getRequestBody());

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 400);
            }

            return $this->respondSuccess($result['data'], 'Registro atualizado com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    // -------------------------------------------------------------------------
    // Exclusão
    // -------------------------------------------------------------------------

    /**
     * DELETE .../delete-soft/{id}
     */
    public function deleteSoft(int $id): ResponseInterface
    {
        try {
            $result = $this->processor->deleteSoft($id);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 404);
            }

            return $this->respondSuccess(null, 'Registro excluído logicamente com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * PATCH .../delete-restore/{id}
     */
    public function deleteRestore(int $id): ResponseInterface
    {
        try {
            $result = $this->processor->deleteRestore($id);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 404);
            }

            return $this->respondSuccess(null, 'Registro restaurado com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * DELETE .../delete-hard/{id}
     */
    public function deleteHard(int $id): ResponseInterface
    {
        try {
            $result = $this->processor->deleteHard($id);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 404);
            }

            return $this->respondSuccess(null, 'Registro excluído permanentemente com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * DELETE .../clear-deleted
     * DELETE .../clear-deleted/{id}
     */
    public function clearDeleted(?int $id = null): ResponseInterface
    {
        try {
            $result = $this->processor->clearDeleted($id);

            return $this->respondSuccess(
                ['affected' => $result['affected']],
                'Registros deletados removidos com sucesso'
            );
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    // -------------------------------------------------------------------------
    // Helpers de resposta
    // -------------------------------------------------------------------------

    protected function respondSuccess(
        mixed $data = null,
        string $message = 'Operação realizada com sucesso',
        int $statusCode = 200
    ): ResponseInterface {
        $body = [
            'method' => strtoupper($this->request->getMethod()),
            'endpoint' => '/' . ltrim($this->request->getUri()->getPath(), '/'),
            'statusCode' => $statusCode,
            'message' => $message,
            'success' => true,
        ];

        if ($data !== null) {
            $body['data'] = $data;
        }

        return $this->response->setStatusCode($statusCode)->setJSON($body);
    }

    protected function respondCreated(
        mixed $data = null,
        string $message = 'Registro criado com sucesso'
    ): ResponseInterface {
        return $this->respondSuccess($data, $message, 201);
    }

    protected function respondPaginated(
        array $data,
        array $pagination,
        string $message = 'Registros listados com sucesso'
    ): ResponseInterface {
        return $this->response->setStatusCode(200)->setJSON([
            'method' => strtoupper($this->request->getMethod()),
            'endpoint' => '/' . ltrim($this->request->getUri()->getPath(), '/'),
            'statusCode' => 200,
            'message' => $message,
            'success' => true,
            'data' => $data,
            'pagination' => $pagination,
        ]);
    }

    protected function respondNotFound(
        string $message = 'Registro não encontrado'
    ): ResponseInterface {
        return $this->response->setStatusCode(404)->setJSON([
            'method' => strtoupper($this->request->getMethod()),
            'endpoint' => '/' . ltrim($this->request->getUri()->getPath(), '/'),
            'statusCode' => 404,
            'message' => $message,
            'success' => false,
        ]);
    }

    protected function respondValidationError(
        array $errors = [],
        string $message = 'Erro de validação'
    ): ResponseInterface {
        return $this->response->setStatusCode(422)->setJSON([
            'method' => strtoupper($this->request->getMethod()),
            'endpoint' => '/' . ltrim($this->request->getUri()->getPath(), '/'),
            'statusCode' => 422,
            'message' => $message,
            'success' => false,
            'errors' => $errors,
        ]);
    }

    protected function respondError(
        string $message,
        int $statusCode = 400
    ): ResponseInterface {
        return $this->response->setStatusCode($statusCode)->setJSON([
            'method' => strtoupper($this->request->getMethod()),
            'endpoint' => '/' . ltrim($this->request->getUri()->getPath(), '/'),
            'statusCode' => $statusCode,
            'message' => $message,
            'success' => false,
        ]);
    }

    protected function respondServerError(\Throwable $e): ResponseInterface
    {
        log_message('error', '[API 500] ' . $e->getMessage() . ' em ' . $e->getFile() . ':' . $e->getLine());

        $body = [
            'method' => strtoupper($this->request->getMethod()),
            'endpoint' => '/' . ltrim($this->request->getUri()->getPath(), '/'),
            'statusCode' => 500,
            'message' => 'Erro interno no servidor',
            'success' => false,
        ];

        if (ENVIRONMENT === 'development') {
            $body['debug'] = [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ];
        }

        return $this->response->setStatusCode(500)->setJSON($body);
    }

    // -------------------------------------------------------------------------
    // Utilitários de requisição
    // -------------------------------------------------------------------------

    protected function getPaginationParams(): array
    {
        return [
            'page' => max(1, (int) ($this->request->getGet('page') ?? 1)),
            'limit' => min(1000, max(1, (int) ($this->request->getGet('limit') ?? 20))),
            'sort' => trim((string) ($this->request->getGet('sort') ?? 'id')),
            'order' => trim((string) ($this->request->getGet('order') ?? 'desc')),
        ];
    }

    protected function extractRequestFilters(array $body): array
    {
        if (array_key_exists('filters', $body)) {
            if (!\is_array($body['filters'])) {
                throw new \InvalidArgumentException('O campo filters deve ser um objeto/array JSON válido');
            }

            return $body['filters'];
        }

        return $body;
    }

    protected function getJsonBody(): array
    {
        return (array) ($this->request->getJSON(true) ?? []);
    }

    protected function getRequestBody(): array
    {
        if ($this->cachedRequestBody !== null) {
            return $this->cachedRequestBody;
        }

        $contentType = $this->request->getHeaderLine('Content-Type');

        if (str_contains($contentType, 'application/json')) {
            $this->cachedRequestBody = (array) ($this->request->getJSON(true) ?? []);
            return $this->cachedRequestBody;
        }

        $this->cachedRequestBody = $this->request->getPost() ?: [];
        return $this->cachedRequestBody;
    }
}
