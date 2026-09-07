<?php

namespace App\Controllers\Api\V1\Upload\UploadManager;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Upload\UploadManager\CreateRequest;
use App\Requests\V1\Upload\UploadManager\UpdateRequest;
use App\Requests\V1\Upload\UploadManager\UploadRequest;
use App\Services\V1\Upload\UploadManager\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para a tabela uploads.
 *
 * As 18 rotas REST canonicas estao em BaseResourceTableController. Este
 * controller declara o Processor + as regras de validacao e adiciona 3 acoes
 * especificas do modulo — nao cobertas pelo padrao por lidarem com binario:
 *
 *   upload()   POST   multipart/form-data  -> grava o arquivo e cria a linha
 *   serve()    GET    /serve/{id}          -> entrega o binario inline
 *   download() GET    /download/{id}       -> entrega o binario como anexo
 *
 * Nenhuma regra de negocio aqui: upload/serve/download apenas orquestram
 * (delegam ao Processor / StorageManager) e formatam a resposta.
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

    // -------------------------------------------------------------------------
    // Acoes especificas do modulo Upload
    // -------------------------------------------------------------------------

    /**
     * POST .../upload  (multipart/form-data)
     *
     * Campos: file (obrigatorio), module, reference_id, collection?, title?, description?
     */
    public function upload(): ResponseInterface
    {
        try {
            $request = new UploadRequest();

            if (!$this->validate($request->rules(), $request->messages())) {
                return $this->respondValidationError($this->validator->getErrors());
            }

            $file = $this->request->getFile('file');

            if ($file === null) {
                return $this->respondValidationError(['file' => 'Nenhum arquivo foi enviado no campo file']);
            }

            $result = $this->processor->store([
                'module'       => (string) ($this->request->getPost('module') ?? ''),
                'reference_id' => (int) ($this->request->getPost('reference_id') ?? 0),
                'collection'   => $this->request->getPost('collection'),
                'title'        => $this->request->getPost('title'),
                'description'  => $this->request->getPost('description'),
            ], $file);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 400);
            }

            return $this->respondCreated($result['data']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        } finally {
            // reservado para log/auditoria/metricas
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
            // reservado para log/auditoria/metricas
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
            // reservado para log/auditoria/metricas
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
