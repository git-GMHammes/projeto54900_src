<?php

namespace App\Models\V1\ChatRooms\ChatRoomsManager;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_chat_rooms_manager — sala + dono (user_manager/user_profiles)
 * + contadores (members_count, blocked_members_count, messages_count, favorites_count).
 *
 * Somente leitura: a view nao tem allowedFields, soft delete nem timestamps
 * proprios (os timestamps expostos sao os da tabela principal).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_chat_rooms_manager';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'cr_name', 'cr_description',
        'um_username', 'uc_name', 'uc_email',
    ];

    protected array $sortableFields = [
        'id', 'cr_owner_user_manager_id', 'cr_name', 'cr_status',
        'um_id', 'um_username', 'uc_id', 'uc_name',
        'members_count', 'blocked_members_count', 'messages_count', 'favorites_count',
        'created_at', 'updated_at',
    ];

    public array $searchFields = [
        'cr_name', 'cr_description',
        'um_username', 'uc_name', 'uc_email',
    ];

    public array $filterFields = ['cr_status', 'um_status'];
}
