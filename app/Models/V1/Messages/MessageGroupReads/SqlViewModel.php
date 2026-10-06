<?php

namespace App\Models\V1\Messages\MessageGroupReads;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_message_group_reads — leitura + mensagem + grupo + leitor (sem dados
 * pessoais sensiveis). Somente leitura; o escopo e do Processor.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_message_group_reads';
    protected $primaryKey = 'id';

    protected array $likeFields = ['mm_content', 'mg_name', 'um_username', 'uc_name'];

    protected array $sortableFields = [
        'id', 'mgr_messages_manager_id', 'mgr_user_manager_id', 'mgr_read_at',
        'mgl_message_groups_manager_id', 'mg_name', 'um_username', 'uc_name', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['mm_content', 'mg_name', 'um_username', 'uc_name'];

    public array $filterFields = ['mgr_messages_manager_id', 'mgr_user_manager_id', 'mgl_message_groups_manager_id'];
}
