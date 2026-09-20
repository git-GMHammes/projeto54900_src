<?php

namespace App\Models\V1\Calendar\CalendarManager;

use App\Models\V1\BaseViewModel;

/**
 * Model de leitura para a view view_calendar_manager.
 *
 * A view une calendar_manager (cm) com calendar_events (ce) — 2 niveis; os 4
 * ramos-filhos de calendar_events (attendees, reminders, attachments,
 * extended_properties) ficam FORA (evita produto cartesiano, ver migration
 * da view). Um calendario sem eventos aparece com todo ce_* NULL.
 *
 * Prefixos na view:
 *   cm_ = calendar_manager (summary, description, status, user_manager_id, ...)
 *   ce_ = calendar_events   (summary, description, start_datetime, status, ...)
 *
 * O `id` exposto e o do evento (ce.id, nivel mais profundo do JOIN); os campos
 * deleted_at/created_at/updated_at refletem calendar_manager (a raiz).
 *
 * Todos os metodos de leitura genericos estao disponiveis via BaseViewModel.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_calendar_manager';
    protected $primaryKey = 'id';

    /**
     * Campos de texto que usam LIKE %valor% no findPaginatedView.
     */
    protected array $likeFields = [
        'cm_summary',
        'cm_description',
        'cm_location',
        'ce_summary',
        'ce_description',
        'ce_location',
    ];

    /** Campos validos para ordenacao */
    protected array $sortableFields = [
        'id',
        'cm_id',
        'cm_summary',
        'cm_status',
        'ce_id',
        'ce_summary',
        'ce_status',
        'ce_start_datetime',
        'created_at',
        'updated_at',
    ];

    /** Campos utilizados na busca textual (GET /search) */
    public array $searchFields = [
        'cm_summary',
        'cm_description',
        'cm_location',
        'ce_summary',
        'ce_description',
        'ce_location',
    ];
}
