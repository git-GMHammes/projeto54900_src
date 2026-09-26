<?php

namespace App\Models\V1\Calendar\CalendarEventInvites;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela calendar_event_invites.
 *
 * Tabela: calendar_event_invites (criada/alterada direto no banco DEV, sem
 * migration versionada — ver README_migrate.md, regra de "nenhuma migration
 * nova sem autorizacao"; DDL documentado em
 * markdown/geral/README_modulo_calendar_event_invites.md).
 * DDL: id (BIGINT PK auto),
 *      calendar_event_id (BIGINT NOT NULL, FK -> calendar_events.id, CASCADE),
 *      user_manager_id (BIGINT NULL, FK -> user_manager.id, CASCADE — o convidado;
 *                       NULL enquanto o convite e so um e-mail sem conta —
 *                       preenchido no accept-token, seja pela conta ja existente
 *                       ou pela conta recem-criada automaticamente),
 *      email (VARCHAR(255) NOT NULL — sempre preenchido: do perfil, quando
 *             user_manager_id e informado no create, ou do valor cru enviado
 *             pelo organizador, quando o convidado ainda nao tem conta),
 *      created_by (BIGINT NULL, FK -> user_manager.id, SET NULL — o organizador que convidou),
 *      token_hash (VARCHAR(64) NOT NULL UNIQUE — sha256 do token cru, nunca o valor em si),
 *      expires_at (DATETIME NOT NULL), used_at (DATETIME NULL — marcado no 1o uso, torna o token de uso unico),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'calendar_event_invites';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [
        'token_hash',
    ];

    protected $allowedFields = [
        'calendar_event_id',
        'user_manager_id',
        'email',
        'created_by',
        'token_hash',
        'expires_at',
        'used_at',
    ];

    protected array $likeFields = [
        'email',
    ];

    protected array $sortableFields = [
        'id',
        'calendar_event_id',
        'user_manager_id',
        'email',
        'created_by',
        'expires_at',
        'used_at',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [];

    /**
     * Convite pendente (nao usado, nao expirado) do usuario neste evento, ou
     * null. Usado para reenviar o convite reaproveitando/substituindo o
     * anterior em vez de acumular tokens ativos.
     */
    public function findPendingByUserInEvent(int $calendarEventId, int $userManagerId): ?array
    {
        $row = $this->db->table($this->table)
            ->where('calendar_event_id', $calendarEventId)
            ->where('user_manager_id', $userManagerId)
            ->where('used_at IS NULL', null, false)
            ->where('expires_at >', date('Y-m-d H:i:s'))
            ->where($this->deletedField . ' IS NULL', null, false)
            ->get()
            ->getRowArray();

        return $row ?: null;
    }

    /**
     * Convite pendente (nao usado, nao expirado) para este e-mail neste
     * evento, ainda sem user_manager_id resolvido (convidado sem conta), ou
     * null. Mesmo papel de findPendingByUserInEvent, para o caso Modo B.
     */
    public function findPendingByEmailInEvent(int $calendarEventId, string $email): ?array
    {
        $row = $this->db->table($this->table)
            ->where('calendar_event_id', $calendarEventId)
            ->where('email', $email)
            ->where('user_manager_id IS NULL', null, false)
            ->where('used_at IS NULL', null, false)
            ->where('expires_at >', date('Y-m-d H:i:s'))
            ->where($this->deletedField . ' IS NULL', null, false)
            ->get()
            ->getRowArray();

        return $row ?: null;
    }

    /**
     * Convite valido para o token informado (ja resolvido para o hash pelo
     * chamador): nao usado, nao expirado, nao excluido. Usado por
     * POST /accept-token.
     */
    public function findValidByTokenHash(string $tokenHash): ?array
    {
        $row = $this->db->table($this->table)
            ->where('token_hash', $tokenHash)
            ->where('used_at IS NULL', null, false)
            ->where('expires_at >', date('Y-m-d H:i:s'))
            ->where($this->deletedField . ' IS NULL', null, false)
            ->get()
            ->getRowArray();

        return $row ?: null;
    }

    /** Marca o convite como usado (reset/invalidacao de uso unico). */
    public function markUsed(int $id): bool
    {
        return $this->update($id, ['used_at' => date('Y-m-d H:i:s')]);
    }
}
