<?php

namespace App\Models\V1\Messages\MessageUsersGroups;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_message_users_groups — um usuario por linha, com
 * groups_count e groups_names (so vinculos ativos). Sem dados pessoais alem de
 * nome e e-mail. Somente leitura.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_message_users_groups';
    protected $primaryKey = 'id';

    protected array $likeFields = ['um_username', 'uc_name', 'uc_email'];

    protected array $sortableFields = [
        'id', 'um_username', 'um_status', 'uc_name', 'groups_count', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['um_username', 'uc_name', 'uc_email'];

    public array $filterFields = ['um_status'];
}
