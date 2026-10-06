<?php

namespace App\Models\V1\Messages\MessageGroupMemberships;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_message_group_memberships — um grupo por linha, com dono,
 * members_count e members_names (so vinculos ativos). `members_search` (nome, usuario e
 * telefone em digitos dos membros) so serve a busca. Somente leitura.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_message_group_memberships';
    protected $primaryKey = 'id';

    protected array $likeFields = ['mg_name', 'mg_description', 'um_username', 'uc_name', 'members_names', 'members_search'];

    protected array $sortableFields = [
        'id', 'mg_owner_user_manager_id', 'mg_name', 'mg_status', 'um_username', 'uc_name',
        'members_count', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['mg_name', 'mg_description', 'um_username', 'uc_name', 'members_names', 'members_search'];

    public array $filterFields = ['mg_status'];
}
