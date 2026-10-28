<?php

namespace App\Models\V1\Template\TempNav;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela temp_nav.
 *
 * Tabela: temp_nav (config/branding do app: nome, imagem, icone, versao)
 * DDL: id (BIGINT PK auto), title, image (nullable), message_icon (nullable),
 *      system_version (nullable, default '1.0.0'),
 *      status (ENUM draft/active/inactive, default draft),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga as linhas cuja lista company_manager traz o slug da empresa da sessao. */
    protected string $companyScope = 'json_slug';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'temp_nav';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'title',
        'image',
        'message_icon',
        'system_version',
        'status',
        'company_manager',
    ];

    protected array $likeFields = [
        'title',
    ];

    protected array $sortableFields = [
        'id',
        'title',
        'system_version',
        'status',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'title',
        'system_version',
    ];
}
