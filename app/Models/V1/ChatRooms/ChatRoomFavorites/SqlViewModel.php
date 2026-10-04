<?php

namespace App\Models\V1\ChatRooms\ChatRoomFavorites;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_chat_room_favorites — favorito + sala (cr) + usuario
 * que favoritou (um/uc).
 *
 * Somente leitura: a view nao tem allowedFields, soft delete nem timestamps
 * proprios (os timestamps expostos sao os da tabela principal).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_chat_room_favorites';
    protected $primaryKey = 'id';

    protected array $likeFields = ['cr_name', 'um_username', 'uc_name'];

    protected array $sortableFields = [
        'id', 'crf_chat_rooms_manager_id', 'crf_user_manager_id',
        'cr_id', 'cr_name', 'cr_status', 'um_id', 'um_username', 'uc_id', 'uc_name',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['cr_name', 'um_username', 'uc_name'];

    public array $filterFields = ['cr_status', 'crf_user_manager_id'];
}
