<?php

namespace App\Models\V1\Messages\MessageGroupMembers;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_message_group_members — vinculo + grupo + usuario.
 * Somente leitura. O escopo (grupos do usuario) e do Processor.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_message_group_members';
    protected $primaryKey = 'id';

    protected array $likeFields = ['mg_name', 'um_username', 'uc_name', 'uc_email'];

    protected array $sortableFields = [
        'id', 'mgm_message_groups_manager_id', 'mgm_user_manager_id', 'mgm_role', 'mgm_status',
        'mg_name', 'um_username', 'uc_name', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['mg_name', 'um_username', 'uc_name', 'uc_email'];

    public array $filterFields = ['mgm_message_groups_manager_id', 'mgm_user_manager_id', 'mgm_role', 'mgm_status'];
}
