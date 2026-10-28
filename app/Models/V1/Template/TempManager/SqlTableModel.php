<?php

namespace App\Models\V1\Template\TempManager;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela temp_manager (catalogo de templates).
 *
 * DDL: id (BIGINT PK auto), company_manager (JSON NOT NULL - slugs das empresas que usam o template;
 *      pode ser lista vazia), code (VARCHAR 30 UNIQUE: template001, template002, template003 - o que o
 *      codigo do frontend reconhece), name (VARCHAR 100), description (VARCHAR 255 NULL),
 *      status (ENUM active/draft/inactive, default draft), created_at, updated_at, deleted_at.
 *
 * Sem escopo por empresa: e um catalogo global, de acesso exclusivo do superuser (filtro
 * 'superuseronly' em Config/Filters.php). O template de UMA empresa e resolvido pelo
 * Services/V1/Template/TemplateRender/Builder.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'temp_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'company_manager',
        'code',
        'name',
        'description',
        'status',
    ];

    protected array $likeFields = [
        'code',
        'name',
        'description',
    ];

    protected array $sortableFields = [
        'id',
        'code',
        'name',
        'status',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'code',
        'name',
        'description',
    ];
}
