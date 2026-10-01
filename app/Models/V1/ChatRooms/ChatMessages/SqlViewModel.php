<?php

namespace App\Models\V1\ChatRooms\ChatMessages;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_chat_messages — mensagem + sala (cr) + autor
 * (user_manager/user_profiles) + attachments_count.
 *
 * Somente leitura: a view nao tem allowedFields, soft delete nem timestamps
 * proprios (os timestamps expostos sao os da tabela principal).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_chat_messages';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'cm_content', 'cr_name',
        'um_username', 'uc_name', 'uc_email',
    ];

    protected array $sortableFields = [
        'id', 'cm_chat_rooms_manager_id', 'cm_user_manager_id', 'cm_status',
        'cr_id', 'cr_name', 'cr_status',
        'um_id', 'um_username', 'uc_id', 'uc_name',
        'attachments_count',
        'created_at', 'updated_at',
    ];

    public array $searchFields = [
        'cm_content', 'cr_name',
        'um_username', 'uc_name', 'uc_email',
    ];

    public array $filterFields = ['cm_status', 'cr_status', 'um_status'];
}
