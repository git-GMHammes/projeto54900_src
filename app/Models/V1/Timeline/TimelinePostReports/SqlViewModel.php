<?php

namespace App\Models\V1\Timeline\TimelinePostReports;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_timeline_post_reports — denuncia + denunciante + moderador + post.
 *
 * Esta e a view da fila de moderacao: leitura restrita a admin pelo filtro
 * adminonly das rotas.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_timeline_post_reports';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'trp_reason', 'trp_description', 'trp_review_note',
        'um_username', 'uc_name', 'mu_username', 'muc_name', 'tp_title',
    ];

    protected array $sortableFields = [
        'id', 'trp_timeline_post_id', 'trp_user_manager_id', 'trp_reason',
        'trp_status', 'trp_reviewed_by', 'trp_reviewed_at',
        'um_username', 'uc_name', 'mu_username', 'muc_name',
        'tp_id', 'tp_title', 'tp_status',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['trp_reason', 'trp_description', 'um_username', 'uc_name', 'tp_title'];

    public array $filterFields = ['trp_status', 'trp_reason'];
}
