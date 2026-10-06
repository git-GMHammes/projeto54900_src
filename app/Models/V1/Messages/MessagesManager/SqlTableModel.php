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
     * Entrega as agendadas: vira `scheduled` -> `sent` as mensagens cuja hora chegou. O `sent_at` recebe a DATA
     * AGENDADA (a mensagem agendada para o dia 9 e entregue no dia 10 com "enviada em" do dia 9, no lugar certo da
     * conversa). O UPDATE condicionado a status='scheduled' evita entregar duas vezes se rodar em paralelo. Quem
     * chama: MessageDispatcher::tick (toda requisicao autenticada, 1x/min), as consultas do chat e o comando
     * `spark messages:dispatch` (so uso local). Devolve quantas mensagens foram entregues.
     */
    public function dispatchDue(): int
    {
        $now = date('Y-m-d H:i:s');

        $this->builder()
            ->where('status', 'scheduled')
            ->where('scheduled_at <=', $now)
            ->where('deleted_at', null)
            ->set('status', 'sent')
            ->set('sent_at', 'scheduled_at', false)
            ->set('updated_at', $now)
            ->update();

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

    /**
     * Quantas mensagens recebidas por $recipientId (ja enviadas, `sent`) ainda nao foram lidas.
     * Mesmo criterio de `mu_unread_count` em view_messages_users.
     */
    public function countUnread(int $recipientId): int
    {
        return (int) $this->builder()
            ->where('recipient_user_manager_id', $recipientId)
            ->where('status', 'sent')
            ->where('read_at', null)
            ->where('deleted_at', null)
            ->countAllResults();
    }

    /**
     * Mensagens de GRUPO ainda nao lidas por $userId (soma de mgcs_unread_count dos grupos dele, em
     * view_message_group_chat_summary — mesmo criterio do badge dos cards de grupo).
     */
    public function countUnreadGroups(int $userId): int
    {
        $row = $this->db->query(
            'SELECT COALESCE(SUM(mgcs_unread_count), 0) AS c FROM view_message_group_chat_summary WHERE mgcs_member_user_manager_id = ?',
            [$userId]
        )->getRow();

        return (int) ($row->c ?? 0);
    }

    /**
     * Anexos ativos (nao excluidos) das mensagens informadas, para mostrar nos baloes do chat.
     *
     * @param  list<int> $messageIds
     * @return array<int, list<array{id: int, name: string, category: string, size: int}>> por id de mensagem
     */
    public function attachmentsFor(array $messageIds): array
    {
        if ($messageIds === []) {
            return [];
        }

        $rows = $this->db->table('message_attachments')
            ->select('id, messages_manager_id, original_name, category, file_size')
            ->whereIn('messages_manager_id', $messageIds)
            ->where('status', 'active')
            ->where('deleted_at', null)
            ->orderBy('id', 'ASC')
            ->get()
            ->getResultArray();

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row['messages_manager_id']][] = [
                'id'       => (int) $row['id'],
                'name'     => (string) $row['original_name'],
                'category' => (string) $row['category'],
                'size'     => (int) $row['file_size'],
            ];
        }

        return $map;
    }
}
