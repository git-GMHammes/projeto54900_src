<?php

namespace App\Models\V1\ChatRooms\ChatRoomAttachments;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela chat_room_attachments — anexo de uma mensagem de chat.
 *
 * Tabela propria e isolada do modulo Upload (mesma decisao da Timeline). O
 * arquivo fisico fica em writable/uploads/chat_messages/<chat_message_id>/;
 * estas colunas guardam os metadados. FK aponta para chat_messages, nao para
 * a sala diretamente — a sala e alcancada via chat_messages.chat_rooms_manager_id.
 * `status` ganha `blocked` quando uma denuncia e confirmada (integracao futura
 * do modulo ChatRoomAttachmentReports, grava direto via update()).
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'chat_room_attachments';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = ['checksum_sha256'];

    protected $allowedFields = [
        'chat_message_id',
        'file_key',
        'original_name',
        'stored_name',
        'storage_path',
        'file_url',
        'mime_type',
        'extension',
        'file_size',
        'checksum_sha256',
        'category',
        'status',
    ];

    protected array $likeFields = ['original_name', 'stored_name'];

    protected array $sortableFields = [
        'id', 'chat_message_id', 'file_key', 'original_name', 'stored_name',
        'extension', 'file_size', 'category', 'status',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['original_name'];
}
