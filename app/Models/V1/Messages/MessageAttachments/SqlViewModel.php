<?php

namespace App\Models\V1\Messages\MessageAttachments;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_message_attachments — anexo + mensagem + conversa
 * (conversation_type private/group), destino, grupo e remetente. Sem dados pessoais
 * sensiveis. Somente leitura; `deleted_at` = anexo ou mensagem excluidos. O escopo
 * (quem ve) e do Processor.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_message_attachments';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'mat_original_name', 'mat_stored_name', 'mm_content',
        'mg_name', 'destination_name', 'sm_username', 'sc_name', 'rm_username', 'rc_name',
    ];

    protected array $sortableFields = [
        'id', 'mat_messages_manager_id', 'mat_original_name', 'mat_extension', 'mat_file_size',
        'mat_category', 'mat_status', 'mm_content', 'mm_status',
        'conversation_type', 'destination_name', 'mg_name', 'sm_username', 'sc_name',
        'created_at', 'updated_at',
    ];

    public array $searchFields = [
        'mat_original_name', 'mm_content', 'mg_name', 'destination_name',
        'sm_username', 'sc_name', 'rm_username', 'rc_name',
    ];

    public array $filterFields = [
        'mat_category', 'mat_status', 'mat_messages_manager_id', 'conversation_type',
        'mgl_message_groups_manager_id', 'mm_sender_user_manager_id',
    ];
}
