<?php

namespace App\Controllers\Api\V1\ChatRooms\ChatRoomAttachments;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\ChatRooms\ChatRoomAttachments\CreateRequest;
use App\Requests\V1\ChatRooms\ChatRoomAttachments\UpdateRequest;
use App\Services\V1\ChatRooms\ChatRoomAttachments\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes na tabela chat_room_attachments.
 *
 * 17 dos 18 endpoints REST estao em BaseResourceTableController; o create e
 * sobrescrito aqui porque e o unico do modulo que recebe ARQUIVO (multipart):
 * o binario chega no campo `file` e os metadados no corpo. O contrato de 18
 * rotas fica intacto — a rota `POST create` e a mesma.
 *
 * Acoes extras (EndpointUpload.php, espelho do TimelinePostAttachments):
 *
 *   serve()    GET  /serve/{id}     -> entrega o binario inline
 *   download() GET  /download/{id}  -> entrega o binario como anexo
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

    /**
     * GET .../serve/{id} — entrega o binario para exibicao inline.
     */
    public function serve(int $id): ResponseInterface
    {
        try {
            $resolved = $this->processor->resolvePhysical($id);

            if ($resolved === null) {
                return $this->respondNotFound('Arquivo nao encontrado ou indisponivel');
            }

            return $this->streamFile($resolved['row'], $resolved['abs_path'], true);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * GET .../download/{id} — entrega o binario como anexo (download forcado).
     */
    public function download(int $id): ResponseInterface
    {
        try {
            $resolved = $this->processor->resolvePhysical($id);

            if ($resolved === null) {
                return $this->respondNotFound('Arquivo nao encontrado ou indisponivel');
            }

            return $this->streamFile($resolved['row'], $resolved['abs_path'], false);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/métricas
        }
    }

    /**
     * Monta a resposta de streaming (DownloadResponse) para serve/download.
     */
    private function streamFile(array $row, string $path, bool $inline): ResponseInterface
    {
        $mime = !empty($row['mime_type']) ? (string) $row['mime_type'] : 'application/octet-stream';
        $name = !empty($row['original_name']) ? (string) $row['original_name'] : (string) $row['stored_name'];

        $download = $this->response->download($path, null);
        $download->setFileName($name);

        if (method_exists($download, 'setContentType')) {
            $download->setContentType($mime);
        }

        if ($inline && method_exists($download, 'inline')) {
            $download->inline();
        }

        $download->setHeader('X-Content-Type-Options', 'nosniff');

        return $download;
    }
}
