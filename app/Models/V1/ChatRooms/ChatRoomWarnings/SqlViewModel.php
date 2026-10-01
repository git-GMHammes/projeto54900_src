<?php

namespace App\Models\V1\ChatRooms\ChatRoomWarnings;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_chat_room_warnings — advertencia + sala (cr) +
 * usuario advertido (um/uc) + mensagem barrada (cm).
 *
 * Somente leitura: a view nao tem allowedFields, soft delete nem timestamps
 * proprios (os timestamps expostos sao os da tabela principal).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_chat_room_warnings';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'crw_flagged_word', 'cr_name', 'um_username', 'uc_name', 'cm_content',
    ];

    protected array $sortableFields = [
        'id', 'crw_chat_rooms_manager_id', 'crw_user_manager_id', 'crw_chat_message_id',
        'crw_flagged_word', 'cr_id', 'cr_name',
        'um_id', 'um_username', 'uc_id', 'uc_name', 'cm_id',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['crw_flagged_word', 'cr_name', 'um_username', 'uc_name', 'cm_content'];
}
