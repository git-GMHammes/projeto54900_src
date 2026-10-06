<?php

namespace App\Models\V1\Messages\MessageGroupMessages;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_message_group_posts — uma mensagem de grupo por linha (id = id da
 * ligacao message_group_messages), com mensagem, grupo, remetente e members_count.
 * Somente leitura; sem dados pessoais sensiveis. O escopo e do Processor.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_message_group_posts';
    protected $primaryKey = 'id';

    protected array $likeFields = ['mm_content', 'mg_name', 'sm_username', 'sc_name'];

    protected array $sortableFields = [
        'id', 'mgl_message_groups_manager_id', 'mm_sender_user_manager_id',
        'mm_content', 'mm_status', 'mm_scheduled_at', 'mm_sent_at',
        'mg_name', 'sm_username', 'sc_name', 'members_count',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['mm_content', 'mg_name', 'sm_username', 'sc_name'];

    public array $filterFields = ['mm_status', 'mgl_message_groups_manager_id', 'mm_sender_user_manager_id'];
}
