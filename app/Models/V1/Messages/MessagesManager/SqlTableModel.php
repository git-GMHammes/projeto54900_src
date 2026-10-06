<?php

namespace App\Models\V1\Messages\MessagesManager;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela messages_manager — mensagem direta de um remetente para um
 * destinatario. NAO e chat: sem sala, conversa ou thread.
 *
 * `status` scheduled/sent/blocked/removed: `scheduled` e a mensagem agendada
 * (invisivel ao destinatario ate o job virar `sent`); `blocked` e a barrada
 * pelo filtro de palavrao (integracao futura); `removed` e remocao/cancelamento
 * pelo remetente. `read_at` marca quando o destinatario viu a mensagem.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'messages_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'sender_user_manager_id',
        'recipient_user_manager_id',
        'content',
        'status',
        'scheduled_at',
        'sent_at',
        'read_at',
    ];

    protected array $likeFields = ['content'];

    protected array $sortableFields = [
        'id', 'sender_user_manager_id', 'recipient_user_manager_id', 'status',
        'scheduled_at', 'sent_at', 'read_at', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['content'];

    /**
     * Ids das mensagens que o usuario pode ver (inclui soft-deletadas, para as
     * rotas get-deleted*): as que enviou (qualquer status) e as que recebeu ja
     * enviadas (status sent). Admin nao usa este metodo.
     *
     * @return list<int>
     */
    public function findVisibleIds(int $userId): array
    {
        $rows = $this->db->table($this->table)
            ->select('id')
            ->groupStart()
                ->where('sender_user_manager_id', $userId)
                ->orGroupStart()
                    ->where('recipient_user_manager_id', $userId)
                    ->where('status', 'sent')
                ->groupEnd()
            ->groupEnd()
            ->get()
            ->getResultArray();

        return array_map(static fn (array $row): int => (int) $row['id'], $rows);
    }

    /**
     * Job messages:dispatch — vira `scheduled` -> `sent` as mensagens cuja hora
     * chegou. O UPDATE condicionado a status='scheduled' evita enviar duas vezes
     * se o job rodar em paralelo. Devolve quantas mensagens foram enviadas.
     */
    public function dispatchDue(): int
    {
        $now = date('Y-m-d H:i:s');

        $this->builder()
            ->where('status', 'scheduled')
            ->where('scheduled_at <=', $now)
            ->where('deleted_at', null)
            ->update(['status' => 'sent', 'sent_at' => $now, 'updated_at' => $now]);

        return $this->db->affectedRows();
    }

    /**
     * Carimba read_at nas mensagens enviadas por $senderId a $recipientId que
     * ainda nao foram lidas. Devolve quantas foram marcadas.
     */
    public function markRead(int $senderId, int $recipientId): int
    {
        $now = date('Y-m-d H:i:s');

        $this->builder()
            ->where('sender_user_manager_id', $senderId)
            ->where('recipient_user_manager_id', $recipientId)
            ->where('status', 'sent')
            ->where('read_at', null)
            ->where('deleted_at', null)
            ->update(['read_at' => $now, 'updated_at' => $now]);

        return $this->db->affectedRows();
    }
}
