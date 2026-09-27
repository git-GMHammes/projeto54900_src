<?php

namespace App\Controllers\Api\V1\Timeline\TimelinePostAttachments;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Timeline\TimelinePostAttachments\CreateRequest;
use App\Requests\V1\Timeline\TimelinePostAttachments\UpdateRequest;
use App\Services\V1\Timeline\TimelinePostAttachments\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes na tabela timeline_post_attachments.
 *
 * 17 dos 18 endpoints REST estao em BaseResourceTableController; o create e
 * sobrescrito aqui porque e o unico do modulo que recebe ARQUIVO (multipart): o
 * binario chega no campo `file` e os metadados no corpo. O contrato de 18 rotas
 * fica intacto — a rota `POST create` e a mesma.
 */
class ResourceTableController extends BaseResourceTableController
{
    public function initController(
        RequestInterface $request,
        ResponseInterface $response,
        LoggerInterface $logger
    ): void {
        parent::initController($request, $response, $logger);
        $this->processor = new Processor();
    }

    protected function getCreateRules(): array
    {
        return (new CreateRequest())->rules();
    }

    protected function getUpdateRules(): array
    {
        return (new UpdateRequest())->rules();
    }

    /**
     * POST .../create (multipart)
     */
    public function create(): ResponseInterface
    {
        try {
            if (!$this->validate($this->getCreateRules())) {
                return $this->respondValidationError($this->validator->getErrors());
            }

            $payload = $this->getRequestBody();

            if (!\is_array($payload) || $payload === []) {
                // Multipart: sem corpo JSON, os campos vem do $_POST.
                $payload = (array) $this->request->getPost();
            }

            $result = $this->processor->store($payload, $this->request->getFile('file'));

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 400);
            }

            return $this->respondCreated($result['data']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }
}
