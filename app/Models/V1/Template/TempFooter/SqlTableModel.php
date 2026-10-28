<?php

namespace App\Models\V1\Template\TempFooter;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela temp_footer (rodape do template).
 *
 * DDL: id (BIGINT PK auto), company_manager (JSON NOT NULL - lista de slugs de empresa),
 *      name VARCHAR(100) NULL, sort_order INT DEFAULT 0, col1..col4_{title,text,image,alt},
 *      status (ENUM active/draft/inactive, default draft), created_at, updated_at, deleted_at.
 *
 * Varias linhas ativas da mesma empresa sao validas: o frontend empilha por sort_order.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga as linhas cuja lista company_manager traz o slug da empresa da sessao. */
    protected string $companyScope = 'json_slug';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'temp_footer';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'company_manager',
        'name',
        'sort_order',
        'col1_title',
        'col1_text',
        'col1_image',
        'col1_alt',
        'col2_title',
        'col2_text',
        'col2_image',
        'col2_alt',
        'col3_title',
        'col3_text',
        'col3_image',
        'col3_alt',
        'col4_title',
        'col4_text',
        'col4_image',
        'col4_alt',
        'status',
    ];

    protected array $likeFields = [
        'name',
        'col1_title',
        'col2_title',
        'col3_title',
        'col4_title',
    ];

    protected array $sortableFields = [
        'id',
        'name',
        'sort_order',
        'status',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'name',
        'col1_title',
        'col2_title',
        'col3_title',
        'col4_title',
    ];
}
