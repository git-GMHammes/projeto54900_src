<?php

namespace App\Models\V1\Calendar\CalendarEventAttachments;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela calendar_event_attachments.
 *
 * Tabela: calendar_event_attachments
 * DDL: id (BIGINT PK auto),
 *      calendar_event_id (BIGINT NOT NULL, FK -> calendar_events.id, CASCADE),
 *      file_url (VARCHAR(500) NOT NULL), title (VARCHAR(255) NULL),
 *      mime_type (VARCHAR(100) NULL), icon_link (VARCHAR(500) NULL),
 *      file_id (VARCHAR(255) NULL),
 *      created_at, updated_at, deleted_at.
 *
 * Observacao: este modulo grava apenas metadados do anexo (URL / Drive fileId).
 * O upload binario e responsabilidade do modulo Upload/UploadManager.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'calendar_event_attachments';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'calendar_event_id',
        'file_url',
        'title',
        'mime_type',
        'icon_link',
        'file_id',
    ];

    protected array $likeFields = [
        'title',
        'mime_type',
    ];

    protected array $sortableFields = [
        'id',
        'calendar_event_id',
        'title',
        'mime_type',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'title',
        'mime_type',
        'file_url',
    ];
}
