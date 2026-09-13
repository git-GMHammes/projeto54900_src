<?php

namespace App\Models\V1\Nav\NavManager;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela nav_manager.
 *
 * Tabela: nav_manager (config/branding do app: nome, imagem, icone, versao)
 * DDL: id (BIGINT PK auto), title, image (nullable), message_icon (nullable),
 *      system_version (nullable, default '1.0.0'),
 *      status (ENUM draft/active/inactive, default draft),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'nav_manager';
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
