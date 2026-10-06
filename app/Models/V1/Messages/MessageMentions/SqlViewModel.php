<?php

namespace App\Models\V1\Messages\MessageMentions;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_message_mentions — marcacao + mensagem + grupo + marcado + autor (sem dados
 * pessoais sensiveis). Somente leitura; o escopo e do Processor.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_message_mentions';
    protected $primaryKey = 'id';

    protected array $likeFields = ['mm_content', 'mg_name', 'um_username', 'uc_name', 'sm_username', 'sc_name'];

    protected array $sortableFields = [
        'id', 'mmt_messages_manager_id', 'mmt_user_manager_id', 'mgl_message_groups_manager_id',
        'mg_name', 'um_username', 'uc_name', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['mm_content', 'mg_name', 'um_username', 'uc_name', 'sm_username', 'sc_name'];

    public array $filterFields = ['mmt_messages_manager_id', 'mmt_user_manager_id', 'mgl_message_groups_manager_id'];
}
