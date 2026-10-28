<?php

namespace App\Models\V1\Template\TempHeader;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela temp_header (cabecalho do template).
 *
 * DDL: id (BIGINT PK auto), company_manager (JSON NOT NULL - lista de slugs de empresa),
 *      name VARCHAR(100) NULL, sort_order INT DEFAULT 0, background_image/background_alt, logo_left|center|right_{text,image,alt}, company_name,
 *      status (ENUM active/draft/inactive, default draft), created_at, updated_at, deleted_at.
 *
 * Varias linhas ativas da mesma empresa sao validas: o frontend empilha por sort_order.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga as linhas cuja lista company_manager traz o slug da empresa da sessao. */
    protected string $companyScope = 'json_slug';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'temp_header';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'company_manager',
        'name',
        'sort_order',
        'background_image',
        'background_alt',
        'logo_left_text',
        'logo_left_image',
        'logo_left_alt',
        'logo_center_text',
        'logo_center_image',
        'logo_center_alt',
        'logo_right_text',
        'logo_right_image',
        'logo_right_alt',
        'company_name',
        'status',
    ];

    protected array $likeFields = [
        'name',
        'company_name',
        'logo_left_text',
        'logo_center_text',
        'logo_right_text',
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
        'company_name',
    ];
}
