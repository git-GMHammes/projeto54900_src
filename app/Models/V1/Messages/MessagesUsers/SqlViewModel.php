<?php

namespace App\Models\V1\Messages\MessagesUsers;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_messages_users — uma linha por par (owner, peer): total
 * de mensagens, nao lidas, ultima mensagem e data, com nome do owner (om/oc)
 * e do interlocutor (pm/pc).
 *
 * Somente leitura e sem coluna deleted_at (como view_user_directory). O `id`
 * e derivado (owner * 4294967296 + peer). O escopo por owner e do Processor.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_messages_users';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'mu_last_content',
        'om_username', 'oc_name',
        'pm_username', 'pc_name', 'pc_email',
    ];

    protected array $sortableFields = [
        'id', 'mu_owner_user_manager_id', 'mu_peer_user_manager_id',
        'mu_messages_count', 'mu_unread_count', 'mu_last_message_id', 'mu_last_message_at',
        'om_username', 'oc_name', 'pm_username', 'pc_name',
        'created_at', 'updated_at',
    ];

    public array $searchFields = [
        'mu_last_content',
        'om_username', 'oc_name',
        'pm_username', 'pc_name', 'pc_email',
    ];

    public array $filterFields = ['mu_last_status', 'pm_status'];
}
