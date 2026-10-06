<?php

namespace App\Models\V1\Messages\MessageGroupsManager;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_message_groups_manager — grupo + dono (user_manager/
 * user_profiles) + contadores (members_count, messages_count).
 *
 * Somente leitura: a view nao tem allowedFields nem soft delete proprios (os
 * timestamps expostos sao os da tabela principal).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_message_groups_manager';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'mg_name', 'mg_description',
        'um_username', 'uc_name', 'uc_email',
    ];

    protected array $sortableFields = [
        'id', 'mg_owner_user_manager_id', 'mg_name', 'mg_status',
        'um_id', 'um_username', 'uc_name',
        'members_count', 'messages_count',
        'created_at', 'updated_at',
    ];

    public array $searchFields = [
        'mg_name', 'mg_description',
        'um_username', 'uc_name', 'uc_email',
    ];

    public array $filterFields = ['mg_status', 'um_status'];
}
