<?php

namespace App\Models\V1\Messages\MessageGroupChat;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_message_group_chat_summary — uma linha por par (membro ativo, grupo), com
 * `mgcs_unread_count` e a ultima mensagem do grupo. `id` e derivado (membro * 4294967296 + grupo)
 * e `deleted_at` e sempre NULL. Somente leitura; o escopo (so as proprias linhas) e do Processor.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_message_group_chat_summary';
    protected $primaryKey = 'id';

    protected array $likeFields = ['mg_name', 'mgcs_last_content'];

    protected array $sortableFields = [
        'id', 'mgcs_member_user_manager_id', 'mgcs_group_id', 'mg_name', 'members_count',
        'mgcs_unread_count', 'mgcs_last_message_id', 'mgcs_last_message_at', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['mg_name', 'mgcs_last_content'];

    public array $filterFields = ['mg_status', 'mgcs_group_id'];
}
