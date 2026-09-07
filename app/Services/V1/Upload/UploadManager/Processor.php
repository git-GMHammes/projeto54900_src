<?php

namespace App\Services\V1\Upload\UploadManager;

use App\Models\V1\Upload\UploadManager\SqlTableModel;
use App\Models\V1\Upload\UploadManager\SqlViewModel;
use App\Services\V1\BaseTableService;
use CodeIgniter\Database\Exceptions\DatabaseException;
use CodeIgniter\HTTP\Files\UploadedFile;
use Config\Upload as UploadConfig;

/**
 * Service de negocio do modulo UploadManager.
 *
 * Todo o CRUD generico (leitura, escrita, exclusao) vem de BaseTableService.
 * Este Processor:
 *  - normaliza module/collection e sela o status no create (prepareData)
 *  - torna os campos fisicos imutaveis via update (prepareUpdateData)
 *  - recusa file_key repetido (validateOnCreate) e, opcionalmente, conteudo
 *    duplicado por dono (Config\Upload::$dedupe)
 *  - adiciona store() (recebe o binario) e resolvePhysical() (serve/download)
 *  - estende deleteHard()/clearDeleted() para apagar tambem o arquivo do disco
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted (+ versoes View).
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel  $viewModel;

    private StorageManager $storage;
    private UploadConfig $config;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
        $this->storage    = new StorageManager();
        $this->config     = config(UploadConfig::class);
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        if (isset($data['module'])) {
            $data['module'] = $this->storage->sanitizeSegment((string) $data['module']);
        }

        if (isset($data['collection'])) {
            $data['collection'] = $this->storage->sanitizeSegment((string) $data['collection']);
        }

        // status nunca vem do cliente no create — usa o DEFAULT da coluna ('active').
        unset($data['status']);

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        // Campos fisicos sao imutaveis via update: alterar qualquer um deles
        // desalinha o registro do arquivo no disco.
        unset(
            $data['file_key'],
            $data['module'],
            $data['original_name'],
            $data['stored_name'],
            $data['storage_path'],
            $data['file_url'],
            $data['mime_type'],
            $data['extension'],
            $data['file_size'],
            $data['checksum_sha256'],
            $data['category']
        );

        return $data;
    }

    protected function validateOnCreate(array $data): ?array
    {
        if (!empty($data['file_key']) && $this->tableModel->existsByFileKey((string) $data['file_key'])) {
            return ['success' => false, 'message' => 'file_key ja utilizado', 'code' => 409];
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Upload de binario (POST /upload)
    // -------------------------------------------------------------------------

    /**
     * Recebe o arquivo enviado, grava no disco e cria a linha em uploads.
     *
     * @param array<string, mixed> $meta module, reference_id, collection?, title?, description?
     *
     * @return array{success: bool, data?: array, message?: string, code?: int}
     */
    public function store(array $meta, UploadedFile $file): array
    {
        $module      = $this->storage->sanitizeSegment((string) ($meta['module'] ?? ''));
        $referenceId = (int) ($meta['reference_id'] ?? 0);
        $collection  = isset($meta['collection']) && $meta['collection'] !== ''
            ? $this->storage->sanitizeSegment((string) $meta['collection'])
            : null;

        if ($module === '_' || $referenceId < 1) {
            return ['success' => false, 'message' => 'module e reference_id sao obrigatorios', 'code' => 422];
        }

        if (!$file->isValid()) {
            return ['success' => false, 'message' => $file->getErrorString(), 'code' => 422];
        }

        $originalName = $file->getClientName();
        $extension    = strtolower($file->getClientExtension() ?: ($file->getExtension() ?: ''));
        $mime         = $file->getClientMimeType() ?: $file->getMimeType();

        $fileKey  = $this->storage->generateKey();
        $physical = $this->storage->persist($file, $module, $referenceId, $fileKey, $extension);

        if ($this->config->dedupe && $physical['checksum'] !== '') {
            $dup = $this->tableModel->findDuplicate($physical['checksum'], $module, $referenceId);
            if ($dup !== null) {
                $this->storage->remove($physical['storage_path']);

                return ['success' => false, 'message' => 'Arquivo identico ja enviado para este registro', 'code' => 409];
            }
        }

        $row = [
            'module'          => $module,
            'reference_id'    => $referenceId,
            'collection'      => $collection,
            'file_key'        => $fileKey,
            'original_name'   => mb_substr($originalName, 0, 255),
            'stored_name'     => $physical['stored_name'],
            'storage_path'    => $physical['storage_path'],
            'file_url'        => '',
            'mime_type'       => $mime ? mb_substr((string) $mime, 0, 150) : null,
            'extension'       => $extension !== '' ? mb_substr($extension, 0, 20) : null,
            'file_size'       => $physical['size'],
            'checksum_sha256' => $physical['checksum'] !== '' ? $physical['checksum'] : null,
            'category'        => $this->storage->categorize($mime, $extension),
            'title'           => isset($meta['title']) && $meta['title'] !== ''
                ? mb_substr((string) $meta['title'], 0, 255)
                : null,
            'description'     => isset($meta['description']) && $meta['description'] !== ''
                ? (string) $meta['description']
                : null,
        ];

        try {
            $id = $this->tableModel->insert($row);

            if (!$id) {
                $this->storage->remove($physical['storage_path']);

                return ['success' => false, 'message' => 'Erro ao registrar o upload', 'code' => 500];
            }

            helper('url');
            // site_url() respeita o indexPage do Config\App (ex.: index.php/...).
            $fileUrl = site_url($this->config->servePath . $id);
            $this->tableModel->update($id, ['file_url' => $fileUrl]);

            return ['success' => true, 'data' => $this->tableModel->find($id)];
        } catch (DatabaseException $e) {
            $this->storage->remove($physical['storage_path']);
            log_message('error', '[' . static::class . '::store] DatabaseException: ' . $e->getMessage());

            return ['success' => false, 'message' => 'Erro ao registrar o upload', 'code' => 500];
        }
    }

    // -------------------------------------------------------------------------
    // Servir arquivo (GET /serve/{id}, GET /download/{id})
    // -------------------------------------------------------------------------

    /**
     * Resolve o arquivo fisico de um upload ativo (status = active, nao deletado).
     *
     * @return array{row: array, abs_path: string}|null
     */
    public function resolvePhysical(int $id): ?array
    {
        $row = $this->tableModel->find($id);

        if (!$row || ($row['status'] ?? 'active') !== 'active') {
            return null;
        }

        $abs = $this->storage->absoluteFromRelative((string) $row['storage_path']);

        if (!is_file($abs)) {
            return null;
        }

        return ['row' => $row, 'abs_path' => $abs];
    }

    // -------------------------------------------------------------------------
    // Exclusao — remove tambem o arquivo do disco
    // -------------------------------------------------------------------------

    /**
     * DELETE /delete-hard/{id} — remove a linha e o arquivo fisico.
     */
    public function deleteHard(int $id): array
    {
        $existing = $this->tableModel->findWithDeleted($id);

        $result = parent::deleteHard($id);

        if (($result['success'] ?? false) && $existing && !empty($existing['storage_path'])) {
            $this->storage->remove((string) $existing['storage_path']);
        }

        return $result;
    }

    /**
     * DELETE /clear-deleted[/{id}] — remove os soft-deleted e seus arquivos fisicos.
     *
     * @return array{affected: int}
     */
    public function clearDeleted(?int $id = null): array
    {
        $targets = $this->tableModel->findDeletedPaginated(1, 100000, 'id', 'asc')['data'] ?? [];

        $result = parent::clearDeleted($id);

        foreach ($targets as $row) {
            if (empty($row['storage_path'])) {
                continue;
            }
            if ($id !== null && (int) $row['id'] !== $id) {
                continue;
            }
            $this->storage->remove((string) $row['storage_path']);
        }

        return $result;
    }
}
