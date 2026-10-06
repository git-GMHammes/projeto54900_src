<?php

namespace App\Models\V1\Messages\MessageWarnings;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_message_warnings — advertencia + mensagem + grupo + autor (sem dados pessoais
 * sensiveis). Somente leitura; so admin (a rota e adminonly).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_message_warnings';
    protected $primaryKey = 'id';

    protected array $likeFields = ['mw_flagged_word', 'mm_content', 'mg_name', 'um_username', 'uc_name'];

    protected array $sortableFields = [
        'id', 'mw_messages_manager_id', 'mw_user_manager_id', 'mw_message_groups_manager_id', 'mw_flagged_word',
        'mm_content', 'mm_status', 'mg_name', 'um_username', 'uc_name', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['mw_flagged_word', 'mm_content', 'mg_name', 'um_username', 'uc_name'];

    public array $filterFields = ['mw_messages_manager_id', 'mw_user_manager_id', 'mw_message_groups_manager_id', 'mm_status'];
}
