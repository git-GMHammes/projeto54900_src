// Editor de membros de grupo (N:N usuarios x grupos) — dois cards lado a lado no desktop
// e empilhados no mobile (`col-12 col-lg-6`).
//
// Card 1 (usuarios): filtro de busca no topo e checklist com ate 1000 usuarios ativos
//   (`message-users-groups-view`). Se o total passa de 1000 e o termo nao esta entre os
//   carregados, a busca vai ao servidor (`search`). Marcar um usuario o poe como "novo"
//   no card 2; quem ja e membro aparece marcado e travado.
// Card 2 (grupo): select de grupos (FormGrid, remoto, com busca) e, dentro dele, um card
//   sem titulo com os membros ativos do grupo (ou vazio). Cada membro tem um checkbox
//   "remover"; o dono fica travado. "Salvar" grava tudo numa chamada (`sync`).
//
// Mudancas ficam PENDENTES ate o Salvar. Quem nao e dono do grupo nem admin so le (o
// backend tambem recusa com 403). As linhas de checklist usam checkbox simples porque sao
// ate 1000 itens por card; o campo Grupo e renderizado pelo FormGrid.
// Usado por UpdatePage (tela dedicada) e CreateModal (etapa 2).

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import {
  messageGroupMembersView,
  messageGroupMembershipsView,
  messageUsersGroupsView,
  syncMessageGroupMembers,
} from '@/services/v1';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';

/** Teto de usuarios carregados no card 1 (acima disso a busca vai ao servidor). */
const USERS_LIMIT = 1000;

interface UserRow {
  id: number;
  name: string;
  username: string;
  email: string;
  groupsCount: number;
}

interface MemberRow {
  userId: number;
  name: string;
  username: string;
  isOwner: boolean;
}

function toUser(row: Record<string, unknown>): UserRow {
  return {
    id: Number(row.id),
    name: toText(row.uc_name, ''),
    username: toText(row.um_username, ''),
    email: toText(row.uc_email, ''),
    groupsCount: Number(row.groups_count ?? 0),
  };
}

function toMember(row: Record<string, unknown>): MemberRow {
  return {
    userId: Number(row.mgm_user_manager_id),
    name: toText(row.uc_name, ''),
    username: toText(row.um_username, ''),
    isOwner: row.mgm_role === 'owner',
  };
}

function label(u: { name: string; username: string }): string {
  return u.name !== '' ? u.name : u.username;
}

export interface GroupMembersEditorProps {
  /** Grupo selecionado ('' = nenhum). */
  groupId: string;
  /** Troca de grupo pelo select; omitido = select travado (grupo fixo). */
  onGroupChange?: (id: string) => void;
  /** Muda para remontar o select de grupos (ex.: depois de criar um grupo novo). */
  groupsVersion?: number;
  /** Chamado depois de um Salvar com sucesso. */
  onSaved?: () => void;
}

export default function GroupMembersEditor({ groupId, onGroupChange, groupsVersion = 0, onSaved }: GroupMembersEditorProps) {
  const toast = useToast();
  const { user: me } = useAuth();
  const isAdmin = me?.role?.slug === 'admin';

  // --- Card 1: usuarios ---
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const term = useDebounce(searchInput, 400).trim();
  const [remoteUsers, setRemoteUsers] = useState<UserRow[] | null>(null);

  // --- Card 2: grupo ---
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<Map<number, UserRow>>(new Map());
  const [pendingRemove, setPendingRemove] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const raw = await messageUsersGroupsView.getAll({ page: 1, limit: USERS_LIMIT, sort: 'uc_name', order: 'ASC' });
      const { rows, total } = normalizeList<Record<string, unknown>>(raw);
      setUsers(rows.map(toUser));
      setUsersTotal(total);
    } catch (err) {
      setUsers([]);
      setUsersTotal(0);
      setUsersError(err instanceof ApiError ? err.message : 'Falha ao carregar os usuarios.');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // Busca no servidor: so quando ha termo e nem todos os usuarios couberam no card.
  const needsRemote = term !== '' && usersTotal > users.length;
  useEffect(() => {
    if (!needsRemote) {
      setRemoteUsers(null);
      return;
    }
    let cancelled = false;
    void messageUsersGroupsView
      .search(term, { page: 1, limit: 100, sort: 'uc_name', order: 'ASC' })
      .then((raw) => {
        if (!cancelled) setRemoteUsers(normalizeList<Record<string, unknown>>(raw).rows.map(toUser));
      })
      .catch(() => {
        if (!cancelled) setRemoteUsers([]);
      });

    return () => {
      cancelled = true;
    };
  }, [needsRemote, term]);

  const visibleUsers = useMemo(() => {
    if (remoteUsers !== null) return remoteUsers;
    if (term === '') return users;
    const q = term.toLowerCase();

    return users.filter((u) => `${u.name} ${u.username} ${u.email}`.toLowerCase().includes(q));
  }, [users, remoteUsers, term]);

  const loadGroup = useCallback(async () => {
    setPendingAdd(new Map());
    setPendingRemove(new Set());
    if (groupId === '') {
      setMembers([]);
      setCanEdit(false);
      return;
    }
    setMembersLoading(true);
    try {
      const [membersRaw, groupRaw] = await Promise.all([
        messageGroupMembersView.find(
          { mgm_message_groups_manager_id: groupId, mgm_status: 'active' },
          { page: 1, limit: USERS_LIMIT, sort: 'uc_name', order: 'ASC' },
        ),
        messageGroupMembershipsView.get(groupId),
      ]);
      setMembers(normalizeList<Record<string, unknown>>(membersRaw).rows.map(toMember));
      const group = normalizeItem<Record<string, unknown>>(groupRaw);
      const ownerId = Number(group?.mg_owner_user_manager_id ?? 0);
      setCanEdit(isAdmin || (me !== null && me !== undefined && ownerId === Number(me.id)));
    } catch (err) {
      setMembers([]);
      setCanEdit(false);
      toast.error(err instanceof ApiError ? err.message : 'Falha ao carregar os membros do grupo.', { title: 'Membros' });
    } finally {
      setMembersLoading(false);
    }
  }, [groupId, isAdmin, me, toast]);

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  const memberIds = useMemo(() => new Set(members.map((m) => m.userId)), [members]);

  const toggleUser = (u: UserRow) => {
    setPendingAdd((prev) => {
      const next = new Map(prev);
      if (next.has(u.id)) next.delete(u.id);
      else next.set(u.id, u);

      return next;
    });
  };

  const toggleRemove = (userId: number) => {
    setPendingRemove((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);

      return next;
    });
  };

  const pendingCount = pendingAdd.size + pendingRemove.size;

  const handleSave = async () => {
    if (groupId === '' || pendingCount === 0) return;
    setSaving(true);
    try {
      const res = await syncMessageGroupMembers(groupId, {
        add_user_ids: [...pendingAdd.keys()],
        remove_user_ids: [...pendingRemove],
      });
      const r = normalizeItem<Record<string, unknown>>(res);
      const added = Number(r?.added ?? 0) + Number(r?.reactivated ?? 0);
      toast.success(`${added} adicionado(s), ${Number(r?.removed ?? 0)} removido(s).`, { title: 'Membros do grupo' });
      await Promise.all([loadGroup(), loadUsers()]);
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao salvar os membros.', { title: 'Membros do grupo' });
    } finally {
      setSaving(false);
    }
  };

  const groupSchema = useMemo<FormGridSchema>(
    () => ({
      rows: [
        {
          fields: [
            {
              type: 'select',
              col: 12,
              label: 'Grupo',
              name: 'message_groups_manager_id',
              placeholder: 'Buscar grupo pelo nome',
              src: '/api/v1/message-group-memberships-view/get-no-pagination?sort=mg_name&order=ASC&limit=1000',
              findSrc: '/api/v1/message-group-memberships-view/find',
              findColumn: 'mg_name',
              getSrc: '/api/v1/message-group-memberships-view/get',
              valueKey: 'id',
              labelTemplate: '{mg_name}',
              value: groupId,
              disabled: onGroupChange === undefined,
              onChange: (value: string) => onGroupChange?.(value),
            },
          ],
        },
      ],
    }),
    [groupId, onGroupChange],
  );

  const renderUserRow = (u: UserRow): ReactNode => {
    const isMember = memberIds.has(u.id);
    const checked = isMember || pendingAdd.has(u.id);

    return (
      <label key={u.id} className="list-group-item d-flex align-items-center gap-2 mb-0">
        <input
          type="checkbox"
          className="form-check-input mt-0"
          checked={checked}
          disabled={isMember || groupId === '' || !canEdit}
          onChange={() => toggleUser(u)}
        />
        <span className="flex-grow-1 text-truncate">
          {label(u)}
          <small className="text-body-secondary ms-1">({u.username})</small>
        </span>
        {isMember && <span className="badge text-bg-secondary">membro</span>}
        {!isMember && u.groupsCount > 0 && <span className="badge text-bg-light border">{u.groupsCount} grupo(s)</span>}
      </label>
    );
  };

  return (
    <div className="row g-3">
      <div className="col-12 col-lg-6">
        <div className="card shadow-sm h-100">
          <div className="card-header fw-semibold">Usuários</div>
          <div className="card-body d-flex flex-column gap-2">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search" aria-hidden="true" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nome, usuário ou e-mail"
                aria-label="Buscar usuários"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput !== '' && (
                <button type="button" className="btn btn-outline-secondary" aria-label="Limpar busca" onClick={() => setSearchInput('')}>
                  <i className="bi bi-x-lg" aria-hidden="true" />
                </button>
              )}
            </div>

            {groupId === '' && <div className="alert alert-info py-2 mb-0">Escolha um grupo ao lado para marcar usuários.</div>}
            {groupId !== '' && !membersLoading && !canEdit && (
              <div className="alert alert-warning py-2 mb-0">Só o dono do grupo ou o admin altera os membros.</div>
            )}
            {usersError && <div className="alert alert-danger py-2 mb-0">{usersError}</div>}

            <div className="position-relative">
              {usersLoading && <LoadingOverlay overlay />}
              <div className="list-group overflow-auto" style={{ maxHeight: '55vh' }}>
                {!usersLoading && visibleUsers.length === 0 && (
                  <div className="list-group-item text-body-secondary">
                    {term !== '' ? `Nenhum usuário corresponde a '${term}'.` : 'Nenhum usuário encontrado.'}
                  </div>
                )}
                {visibleUsers.map(renderUserRow)}
              </div>
            </div>
            <small className="text-body-secondary">
              {usersTotal > users.length
                ? `Mostrando ${users.length} de ${usersTotal} usuários; a busca consulta todos.`
                : `${usersTotal} usuário(s).`}
            </small>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-6">
        <div className="card shadow-sm h-100">
          <div className="card-header fw-semibold">Grupo</div>
          <div className="card-body d-flex flex-column gap-3">
            <FormGrid key={groupsVersion} schema={groupSchema} />

            <div className="card flex-grow-1">
              <div className="card-body p-2 position-relative">
                {membersLoading && <LoadingOverlay overlay />}
                <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '45vh' }}>
                  {groupId !== '' && !membersLoading && members.length === 0 && pendingAdd.size === 0 && (
                    <div className="list-group-item text-body-secondary">Nenhum membro.</div>
                  )}
                  {members.map((m) => {
                    const removing = pendingRemove.has(m.userId);

                    return (
                      <label key={m.userId} className="list-group-item d-flex align-items-center gap-2 mb-0">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          checked={removing}
                          disabled={m.isOwner || !canEdit}
                          aria-label={`Remover ${label(m)} do grupo`}
                          onChange={() => toggleRemove(m.userId)}
                        />
                        <span className={`flex-grow-1 text-truncate${removing ? ' text-decoration-line-through text-body-secondary' : ''}`}>
                          {label(m)}
                          <small className="text-body-secondary ms-1">({m.username})</small>
                        </span>
                        {m.isOwner && <span className="badge text-bg-primary">dono</span>}
                        {removing && <span className="badge text-bg-danger">remover</span>}
                      </label>
                    );
                  })}
                  {[...pendingAdd.values()].map((u) => (
                    <div key={`add-${u.id}`} className="list-group-item list-group-item-success d-flex align-items-center gap-2">
                      <span className="flex-grow-1 text-truncate">
                        {label(u)}
                        <small className="ms-1">({u.username})</small>
                      </span>
                      <span className="badge text-bg-success">novo</span>
                      <button type="button" className="btn btn-sm btn-outline-secondary" aria-label={`Desfazer ${label(u)}`} onClick={() => toggleUser(u)}>
                        <i className="bi bi-x-lg" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
            <small className="text-body-secondary">
              {pendingCount === 0
                ? 'Sem alterações pendentes.'
                : `${pendingAdd.size} a adicionar · ${pendingRemove.size} a remover`}
            </small>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={pendingCount === 0 || saving}
                onClick={() => {
                  setPendingAdd(new Map());
                  setPendingRemove(new Set());
                }}
              >
                Descartar
              </button>
              <button type="button" className="btn btn-primary" disabled={pendingCount === 0 || saving || !canEdit} onClick={() => void handleSave()}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
