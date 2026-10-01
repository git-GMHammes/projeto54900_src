<?php

namespace App\Models\V1\ChatRooms\ChatRoomAttachmentReports;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_chat_room_attachment_reports — denuncia + anexo
 * denunciado (cra) + denunciante (um/uc) + revisor (mu/muc).
 *
 * Somente leitura: a view nao tem allowedFields, soft delete nem timestamps
 * proprios (os timestamps expostos sao os da tabela principal).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_chat_room_attachment_reports';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'crar_description', 'crar_review_note',
        'cra_original_name', 'um_username', 'uc_name',
    ];

    protected array $sortableFields = [
        'id', 'crar_chat_room_attachment_id', 'crar_reporter_user_manager_id',
        'crar_reason', 'crar_status', 'crar_reviewed_by', 'crar_reviewed_at',
        'cra_id', 'cra_original_name',
        'um_id', 'um_username', 'uc_id', 'uc_name',
        'mu_id', 'mu_username', 'muc_id', 'muc_name',
        'created_at', 'updated_at',
    ];

    public array $searchFields = [
        'crar_description', 'crar_review_note', 'cra_original_name', 'um_username', 'uc_name',
    ];

    public array $filterFields = ['crar_reason', 'crar_status'];
}
