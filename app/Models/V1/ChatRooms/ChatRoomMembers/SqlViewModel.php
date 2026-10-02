<?php

namespace App\Models\V1\ChatRooms\ChatRoomMembers;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_chat_room_members — matricula (crm) + sala (cr) +
 * usuario (um/uc).
 *
 * Somente leitura: a view nao tem allowedFields, soft delete nem timestamps
 * proprios (os timestamps expostos sao os da tabela principal).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_chat_room_members';
    protected $primaryKey = 'id';

    protected array $likeFields = ['cr_name', 'um_username', 'uc_name', 'uc_email'];

    protected array $sortableFields = [
        'id', 'crm_chat_rooms_manager_id', 'crm_user_manager_id', 'crm_role', 'crm_status',
        'crm_blocked_reason', 'crm_blocked_at',
        'cr_id', 'cr_name', 'cr_status', 'um_id', 'um_username', 'um_status', 'uc_id', 'uc_name', 'uc_email',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['cr_name', 'um_username', 'uc_name', 'uc_email'];

    public array $filterFields = ['crm_chat_rooms_manager_id', 'crm_user_manager_id', 'crm_role', 'crm_status', 'crm_blocked_reason'];
}
