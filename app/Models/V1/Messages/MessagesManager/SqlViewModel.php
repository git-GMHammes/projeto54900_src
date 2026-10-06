<?php

namespace App\Models\V1\Messages\MessagesManager;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_messages_manager — mensagem + remetente (sm/sc) +
 * destinatario (rm/rc).
 *
 * Somente leitura: a view nao tem allowedFields, soft delete nem timestamps
 * proprios (os timestamps expostos sao os da tabela principal).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_messages_manager';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'mm_content',
        'sm_username', 'sc_name', 'sc_email',
        'rm_username', 'rc_name', 'rc_email',
    ];

    protected array $sortableFields = [
        'id', 'mm_sender_user_manager_id', 'mm_recipient_user_manager_id', 'mm_status',
        'mm_scheduled_at', 'mm_sent_at', 'mm_read_at',
        'sm_id', 'sm_username', 'sc_id', 'sc_name',
        'rm_id', 'rm_username', 'rc_id', 'rc_name',
        'created_at', 'updated_at',
    ];

    public array $searchFields = [
        'mm_content',
        'sm_username', 'sc_name', 'sc_email',
        'rm_username', 'rc_name', 'rc_email',
    ];

    public array $filterFields = ['mm_status', 'sm_status', 'rm_status'];
}
