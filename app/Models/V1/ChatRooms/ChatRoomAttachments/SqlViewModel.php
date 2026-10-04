<?php

namespace App\Models\V1\ChatRooms\ChatRoomAttachments;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_chat_room_attachments — anexo + mensagem dona (cm) +
 * sala (cr) + autor da mensagem (user_manager/user_profiles).
 *
 * Somente leitura: a view nao tem allowedFields, soft delete nem timestamps
 * proprios (os timestamps expostos sao os da tabela principal).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_chat_room_attachments';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'cra_original_name', 'cra_stored_name',
        'cr_name', 'um_username', 'uc_name',
    ];

    protected array $sortableFields = [
        'id', 'cra_chat_message_id', 'cra_original_name', 'cra_extension',
        'cra_file_size', 'cra_category', 'cra_status',
        'cm_id', 'cm_chat_rooms_manager_id', 'cm_user_manager_id',
        'cr_id', 'cr_name', 'um_id', 'um_username', 'uc_id', 'uc_name',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['cra_original_name', 'cr_name', 'um_username', 'uc_name'];

    public array $filterFields = ['cra_category', 'cra_status', 'cra_chat_message_id'];
}
