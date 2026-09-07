<?php

namespace App\Models\V1\Upload\UploadManager;

use App\Models\V1\BaseViewModel;

/**
 * Model de leitura da view view_upload_manager.
 *
 * Projecao direta da tabela uploads (sem JOIN). Prefixo up_ nas colunas de
 * negocio; id e os timestamps/deleted_at expostos sao os da tabela uploads.
 * checksum_sha256 nao consta na view.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_upload_manager';
    protected $primaryKey = 'id';

    /** Campos de texto que usam LIKE %valor% no findPaginatedView. */
    protected array $likeFields = [
        'up_module',
        'up_collection',
        'up_original_name',
        'up_title',
        'up_description',
    ];

    /** Campos validos para ORDER BY. */
    protected array $sortableFields = [
        'id',
        'up_module',
        'up_reference_id',
        'up_collection',
        'up_category',
        'up_status',
        'up_file_size',
        'up_original_name',
        'up_title',
        'created_at',
        'updated_at',
    ];

    /** Campos utilizados na busca textual (GET /search). */
    public array $searchFields = [
        'up_module',
        'up_collection',
        'up_original_name',
        'up_title',
        'up_description',
    ];
}
