// Primeira tela do MODO CHAT (Etapa 1): lista de conversas — NAO e tabela nem grid, e uma lista de cards.
//
//   [ busca ]  nome, usuario ou telefone (com ou sem mascara); tambem acha grupos pelo nome do grupo ou
//              por quem participa dele (so grupos de que o usuario logado e dono ou membro)
//   Grupos     os grupos do usuario logado: nome em negrito; abaixo, "N membros" em cinza e fonte menor
//   Usuarios   todos os usuarios ativos, exceto o proprio: nome em negrito; abaixo, "usuario · celular"
//              em cinza e fonte menor; carregados em paginas ("Carregar mais")
//              Etapa 3: badge vermelho com as mensagens NAO LIDAS de cada um (message-users-view, consulta a
//              cada 10 s); quem tem nao lidas sobe ao topo, do mais recente para o mais antigo (sem busca, quem
//              ainda nao foi carregado nas paginas entra tambem, com nome e usuario)
// Grupos      Etapa 4: o mesmo badge de nao lidas (message-group-chat-view) e a mesma ordem (com nao lidas no topo)
//
// Cada card e um botao que abre o ChatModal (conversa 1 para 1 privada com o usuario, ou com o grupo).
// Fontes: message-group-memberships-view (grupos visiveis ao usuario) e message-contacts-view (contatos).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import PageHeader from '@/components/global/PageHeader';
import { useDebounce } from '@/hooks/useDebounce';
import { ApiError } from '@/services/http';
import { notifyUnreadChanged } from '@/hooks/useUnreadMessages';
import { messageContactsView, messageGroupChatView, messageGroupMembershipsView, messagesUsersView } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import ChatModal from './ChatModal';
import type { ChatTarget } from './ChatModal';

/** Usuarios por pagina na lista (o resto vem em "Carregar mais"). */
const USERS_PAGE_SIZE = 50;
/** Intervalo da atualizacao das nao lidas (ms). */
const UNREAD_POLL_MS = 10000;
/** Teto de grupos exibidos (o usuario participa de poucos; a busca refina). */
const GROUPS_LIMIT = 200;

interface GroupItem {
  id: number;
  name: string;
  membersCount: number;
}

interface UserItem {
  id: number;
  name: string;
  username: string;
  phone: string;
}

/** Nao lidas e ultima mensagem de um grupo (message-group-chat-view, escopado ao usuario logado). */
interface GroupInfo {
  unread: number;
  last: string;
}

/** Nao lidas e ultima mensagem de um interlocutor (message-users-view, escopado ao usuario logado). */
interface PeerInfo {
  unread: number;
  last: string;
  name: string;
  username: string;
}

function toGroup(row: Record<string, unknown>): GroupItem {
  return { id: Number(row.id), name: toText(row.mg_name, 'Grupo'), membersCount: Number(row.members_count ?? 0) };
}

function toUser(row: Record<string, unknown>): UserItem {
  const username = toText(row.um_username, '');

  return {
    id: Number(row.id),
    name: toText(row.uc_name, '') || username,
    username,
    phone: toText(row.uc_phone, ''),
  };
}

/** Celular BR com mascara quando tem 10 ou 11 digitos; outro formato segue como veio. */
function formatPhone(raw: string): string {
  const d = raw.replace(/\D+/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;

  return raw;
}

export default function ChatHomePage() {
  const [searchInput, setSearchInput] = useState('');
  const term = useDebounce(searchInput, 400).trim();
  const [target, setTarget] = useState<ChatTarget | null>(null);

  // --- Grupos ---
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  // --- Usuarios (paginados) ---
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const usersSeq = useRef(0);
  const groupsSeq = useRef(0);

  // --- Nao lidas por interlocutor (Etapa 3) ---
  const [peers, setPeers] = useState<Record<number, PeerInfo>>({});
  const [groupInfo, setGroupInfo] = useState<Record<number, GroupInfo>>({});

  // Termo novo => volta para a primeira pagina de usuarios.
  useEffect(() => {
    setUsersPage(1);
  }, [term]);

  const loadGroups = useCallback(async () => {
    const seq = ++groupsSeq.current;
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const paging = { page: 1, limit: GROUPS_LIMIT, sort: 'mg_name', order: 'ASC' } as const;
      const raw = term === '' ? await messageGroupMembershipsView.getAll(paging) : await messageGroupMembershipsView.search(term, paging);
      if (seq !== groupsSeq.current) return;
      setGroups(normalizeList<Record<string, unknown>>(raw).rows.map(toGroup));
    } catch (err) {
      if (seq !== groupsSeq.current) return;
      setGroups([]);
      setGroupsError(err instanceof ApiError ? err.message : 'Falha ao carregar os grupos.');
    } finally {
      if (seq === groupsSeq.current) setGroupsLoading(false);
    }
  }, [term]);

  const loadUsers = useCallback(async () => {
    const seq = ++usersSeq.current;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const paging = { page: usersPage, limit: USERS_PAGE_SIZE, sort: 'uc_name', order: 'ASC' } as const;
      const raw = term === '' ? await messageContactsView.getAll(paging) : await messageContactsView.search(term, paging);
      if (seq !== usersSeq.current) return;
      const { rows, total } = normalizeList<Record<string, unknown>>(raw);
      const items = rows.map(toUser);
      setUsers((prev) => (usersPage === 1 ? items : [...prev, ...items]));
      setUsersTotal(total);
    } catch (err) {
      if (seq !== usersSeq.current) return;
      if (usersPage === 1) setUsers([]);
      setUsersError(err instanceof ApiError ? err.message : 'Falha ao carregar os usuários.');
    } finally {
      if (seq === usersSeq.current) setUsersLoading(false);
    }
  }, [term, usersPage]);

  const loadPeers = useCallback(async () => {
    try {
      const raw = await messagesUsersView.getAll({ page: 1, limit: 1000, sort: 'mu_last_message_at', order: 'DESC' });
      const next: Record<number, PeerInfo> = {};
      for (const row of normalizeList<Record<string, unknown>>(raw).rows) {
        const id = Number(row.mu_peer_user_manager_id);
        next[id] = {
          unread: Number(row.mu_unread_count ?? 0),
          last: toText(row.mu_last_message_at, ''),
          name: toText(row.pc_name, '') || toText(row.pm_username, ''),
          username: toText(row.pm_username, ''),
        };
      }
      setPeers(next);

      const rawGroups = await messageGroupChatView.getAll({ page: 1, limit: 1000, sort: 'mgcs_last_message_at', order: 'DESC' });
      const nextGroups: Record<number, GroupInfo> = {};
      for (const row of normalizeList<Record<string, unknown>>(rawGroups).rows) {
        nextGroups[Number(row.mgcs_group_id)] = {
          unread: Number(row.mgcs_unread_count ?? 0),
          last: toText(row.mgcs_last_message_at, ''),
        };
      }
      setGroupInfo(nextGroups);
    } catch {
      // Falha pontual: mantem as ultimas contagens (os badges nao devem piscar nem quebrar a lista).
    }
  }, []);

  useEffect(() => {
    void loadPeers();
    const timer = window.setInterval(() => {
      if (!document.hidden) void loadPeers();
    }, UNREAD_POLL_MS);

    return () => window.clearInterval(timer);
  }, [loadPeers]);

  // Quem tem nao lidas sobe ao topo (mais recente primeiro); o resto segue na ordem da API.
  const orderedUsers = useMemo(() => {
    const loaded = new Set(users.map((u) => u.id));
    const extra: UserItem[] =
      term === ''
        ? Object.entries(peers)
            .filter(([id, p]) => p.unread > 0 && !loaded.has(Number(id)))
            .map(([id, p]) => ({ id: Number(id), name: p.name, username: p.username, phone: '' }))
        : [];
    const all = [...users, ...extra];
    const unreadFirst = all
      .filter((u) => (peers[u.id]?.unread ?? 0) > 0)
      .sort((a, b) => (peers[b.id]?.last ?? '').localeCompare(peers[a.id]?.last ?? ''));
    const rest = all.filter((u) => (peers[u.id]?.unread ?? 0) === 0);

    return [...unreadFirst, ...rest];
  }, [users, peers, term]);

  // Grupos com nao lidas sobem ao topo (mais recente primeiro); o resto segue na ordem da API.
  const orderedGroups = useMemo(() => {
    const unreadFirst = groups
      .filter((g) => (groupInfo[g.id]?.unread ?? 0) > 0)
      .sort((a, b) => (groupInfo[b.id]?.last ?? '').localeCompare(groupInfo[a.id]?.last ?? ''));
    const rest = groups.filter((g) => (groupInfo[g.id]?.unread ?? 0) === 0);

    return [...unreadFirst, ...rest];
  }, [groups, groupInfo]);

  const closeChat = useCallback(() => {
    setTarget(null);
    void loadPeers();
    notifyUnreadChanged();
  }, [loadPeers]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const hasMoreUsers = users.length < usersTotal;
  const nothingFound = !groupsLoading && !usersLoading && groups.length === 0 && orderedUsers.length === 0 && !groupsError && !usersError;

  return (
    <>
      <PageHeader title="Conversas" subtitle="Escolha um usuário ou um grupo para conversar." />

      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-search" aria-hidden="true" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nome, usuário, telefone ou grupo"
            aria-label="Buscar conversas"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput !== '' && (
            <button type="button" className="btn btn-outline-secondary" aria-label="Limpar busca" onClick={() => setSearchInput('')}>
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {nothingFound && (
        <EmptyState
          variant={term !== '' ? 'warning' : 'muted'}
          eyebrow={term !== '' ? 'Busca' : undefined}
          title={term !== '' ? 'Nenhuma conversa encontrada' : 'Nenhum usuário disponível'}
          description={term !== '' ? `Nada corresponde a '${term}'.` : 'Ainda não há outros usuários para conversar.'}
        />
      )}

      {(groups.length > 0 || groupsError || (groupsLoading && term === '')) && (
        <section className="mb-4" aria-label="Grupos">
          <h2 className="h6 text-body-secondary text-uppercase mb-2">Grupos {groups.length > 0 && <span>({groups.length})</span>}</h2>
          {groupsError && <div className="alert alert-danger py-2">{groupsError}</div>}
          <div className="card shadow-sm position-relative">
            {groupsLoading && <LoadingOverlay overlay />}
            <div className="list-group list-group-flush">
              {orderedGroups.map((g) => {
                const unread = groupInfo[g.id]?.unread ?? 0;

                return (
                  <button
                    key={g.id}
                    type="button"
                    className="list-group-item list-group-item-action text-start d-flex justify-content-between align-items-start gap-2"
                    onClick={() => setTarget({ kind: 'group', id: g.id, title: g.name })}
                  >
                    <span className="text-break" style={{ minWidth: 0 }}>
                      <span className="d-block fw-bold">{g.name}</span>
                      <span className="d-block small text-body-secondary">{g.membersCount} membro(s)</span>
                    </span>
                    {unread > 0 && (
                      <span className="badge rounded-pill text-bg-danger align-self-center flex-shrink-0">
                        {unread > 99 ? '99+' : unread}
                        <span className="visually-hidden"> mensagens nao lidas</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {(orderedUsers.length > 0 || usersError || usersLoading) && (
        <section aria-label="Usuários">
          <h2 className="h6 text-body-secondary text-uppercase mb-2">Usuários {usersTotal > 0 && <span>({usersTotal})</span>}</h2>
          {usersError && <div className="alert alert-danger py-2">{usersError}</div>}
          <div className="card shadow-sm position-relative">
            {usersLoading && users.length === 0 && <LoadingOverlay overlay />}
            <div className="list-group list-group-flush">
              {orderedUsers.map((u) => {
                const unread = peers[u.id]?.unread ?? 0;

                return (
                  <button
                    key={u.id}
                    type="button"
                    className="list-group-item list-group-item-action text-start d-flex justify-content-between align-items-start gap-2"
                    onClick={() => setTarget({ kind: 'user', id: u.id, title: u.name })}
                  >
                    <span className="text-break" style={{ minWidth: 0 }}>
                      <span className="d-block fw-bold">{u.name}</span>
                      <span className="d-block small text-body-secondary">
                        {[u.username, u.phone !== '' ? formatPhone(u.phone) : ''].filter((part) => part !== '').join(' · ')}
                      </span>
                    </span>
                    {unread > 0 && (
                      <span className="badge rounded-pill text-bg-danger align-self-center flex-shrink-0">
                        {unread > 99 ? '99+' : unread}
                        <span className="visually-hidden"> mensagens nao lidas</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {hasMoreUsers && (
            <div className="text-center mt-3">
              <button type="button" className="btn btn-outline-secondary" disabled={usersLoading} onClick={() => setUsersPage((p) => p + 1)}>
                {usersLoading ? 'Carregando...' : `Carregar mais (${usersTotal - users.length})`}
              </button>
            </div>
          )}
        </section>
      )}

      <ChatModal target={target} onClose={closeChat} />
    </>
  );
}
