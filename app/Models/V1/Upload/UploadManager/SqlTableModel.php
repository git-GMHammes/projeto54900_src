<?php

namespace App\Models\V1\Upload\UploadManager;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela uploads.
 *
 * Tabela: uploads
 * DDL: id (BIGINT PK auto), module, reference_id, collection (nullable),
 *      file_key (CHAR(32) unique), original_name, stored_name, storage_path,
 *      file_url, mime_type (nullable), extension (nullable), file_size (nullable),
 *      checksum_sha256 (nullable), category (ENUM, default other),
 *      title (nullable), description (nullable), status (ENUM active/inactive,
 *      default active), created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'uploads';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    /**
     * checksum_sha256 e uso interno (dedupe/integridade) — nunca sai na API.
     */
    protected $hidden = [
        'checksum_sha256',
    ];

    /**
     * Campos inseriveis/atualizaveis via Model. Exclui id e timestamps.
     * A imutabilidade dos campos fisicos no update e garantida no Processor
     * (prepareUpdateData), nao aqui.
     */
    protected $allowedFields = [
        'module',
        'reference_id',
        'collection',
        'file_key',
        'original_name',
        'stored_name',
        'storage_path',
        'file_url',
        'mime_type',
        'extension',
        'file_size',
        'checksum_sha256',
        'category',
        'title',
        'description',
        'status',
    ];

    /** Campos de texto que usam LIKE %valor% no find. */
    protected array $likeFields = [
        'module',
        'collection',
        'original_name',
        'title',
    ];

    /** Campos validos para ORDER BY (whitelist anti-SQL-injection). */
    protected array $sortableFields = [
        'id',
        'module',
        'reference_id',
        'collection',
        'category',
        'status',
        'file_size',
        'original_name',
        'title',
        'created_at',
        'updated_at',
    ];

    /** Campos varridos pelo GET /search. */
    public array $searchFields = [
        'module',
        'collection',
        'original_name',
        'title',
        'description',
    ];

    /**
     * Alias semantico sobre existsByField para a coluna file_key.
     */
    public function existsByFileKey(string $fileKey, ?int $excludeId = null): bool
    {
        return $this->existsByField('file_key', $fileKey, $excludeId);
    }

    /**
     * Retorna o upload ativo com o mesmo conteudo (sha256) para o mesmo dono,
     * ou null. Usado pelo dedupe opcional (Config\Upload::$dedupe).
     */
    public function findDuplicate(string $checksum, string $module, int $referenceId): ?array
    {
        $row = $this->db->table($this->table)
            ->where('checksum_sha256', $checksum)
            ->where('module', $module)
            ->where('reference_id', $referenceId)
            ->where($this->deletedField . ' IS NULL', null, false)
            ->get()
            ->getRowArray();

        return $row ? $this->hideFields($row) : null;
    }
}
