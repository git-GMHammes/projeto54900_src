<?php

namespace App\Models\V1\Form\FormManager;

use App\Models\V1\BaseViewModel;

/**
 * Model de leitura para a view view_form_manager.
 *
 * A view achata form_manager -> form_groups -> form_rows -> form_campos
 * (1 linha por campo).
 *
 * Prefixos na view:
 *   fm_ = form_manager   fg_ = form_groups   fr_ = form_rows   fc_ = form_campos
 *
 * id (PK da view) = form_campos.id (pode ser NULL em ramo sem campos).
 * created_at/updated_at/deleted_at refletem form_manager.
 *
 * Todos os metodos genericos de leitura vem de BaseViewModel.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_form_manager';
    protected $primaryKey = 'id';

    /** Campos de texto que usam LIKE %valor% no findPaginatedView. */
    protected array $likeFields = [
        'fm_slug',
        'fm_title',
        'fm_profile_group',
        'fm_react_route',
        'fg_title',
        'fg_slug',
        'fr_label',
        'fc_label',
        'fc_field_name',
        'fc_field_key',
        'fc_placeholder',
    ];

    /** Campos validos para ORDER BY. */
    protected array $sortableFields = [
        'id',
        'fm_id',
        'fm_slug',
        'fm_status',
        'fg_id',
        'fg_sort_order',
        'fr_id',
        'fr_sort_order',
        'fc_id',
        'fc_sort_order',
        'fc_field_type',
        'created_at',
        'updated_at',
    ];

    /** Campos varridos pelo GET /search. */
    public array $searchFields = [
        'fm_slug',
        'fm_title',
        'fm_profile_group',
        'fg_title',
        'fr_label',
        'fc_label',
        'fc_field_name',
        'fc_placeholder',
        'fc_help_text',
    ];
}
