<?php

namespace App\Models\V1\ChatRooms\ChatRoomAttachmentReports;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela chat_room_attachment_reports — denuncia de anexo.
 *
 * Diferente de timeline_post_reports: aqui a acao e IMEDIATA (README §4.6) —
 * `status` nasce `resolved` porque o Processor ja bloqueia o anexo e a
 * matricula do autor do upload no mesmo request. `reviewed_by`/
 * `reviewed_at`/`review_note` ficam so para auditoria/admin (nao sao fila de
 * pendencia). UNIQUE (chat_room_attachment_id, reporter_user_manager_id):
 * uma denuncia por usuario por anexo.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'chat_room_attachment_reports';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'chat_room_attachment_id',
        'reporter_user_manager_id',
        'reason',
        'description',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_note',
    ];

    protected array $likeFields = ['description', 'review_note'];

    protected array $sortableFields = [
        'id', 'chat_room_attachment_id', 'reporter_user_manager_id', 'reason',
        'status', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['description', 'review_note'];
}
