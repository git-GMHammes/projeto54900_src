// Modal de troca de perfil/role da lista de seguranca (user-manager/GetAllPage.tsx,
// acao data_action 'change-role'). Opcoes = user_roles (userRolesTable, nada
// fixo no codigo); pre-seleciona o role atual (um_user_role_id da view).
// Envia PUT /api/v1/user-manager/update/{id} com { user_role_id } — existencia
// do id checada no backend (UserManager\Processor, 422).

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { userManagerTable, userRolesTable } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { str } from '@/utils/listConstructor';

interface RoleOption {
  id: string;
  name: string;
}

export default function ChangeRoleModal({
  userId,
  username,
  currentRoleId,
  onClose,
  onSaved,
}: {
  /** id do user_manager; null = modal fechado. */
  userId: string | null;
  username: string;
  currentRoleId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [roleId, setRoleId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userId === null) return;
    setRoleId(currentRoleId);
    setRolesError(null);
    userRolesTable
      .getNoPagination({ sort: 'id', order: 'ASC' })
      .then((raw) => {
        const { rows } = normalizeList<Record<string, unknown>>(raw);
        setRoles(rows.map((r) => ({ id: str(r.id), name: str(r.name) || str(r.slug) })));
      })
      .catch((err) => {
        setRoles([]);
        setRolesError(err instanceof ApiError ? err.message : 'Falha ao carregar os perfis.');
      });
  }, [userId, currentRoleId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId || roleId === '') return;
    setSaving(true);
    try {
      await userManagerTable.update(userId, { user_role_id: Number(roleId) });
      toast.success('Perfil atualizado.', { title: username || 'Perfil/Role' });
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao atualizar o perfil.', { title: 'Perfil/Role' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={userId !== null} title={`Perfil/Role${username ? `: ${username}` : ''}`} onClose={onClose}>
      <form onSubmit={(e) => void submit(e)}>
        <div className="mb-3">
          <label className="form-label" htmlFor="change-role">Perfil</label>
          <select
            id="change-role"
            className={`form-select${rolesError ? ' is-invalid' : ''}`}
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <option value="">Selecione…</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {rolesError && <div className="invalid-feedback">{rolesError}</div>}
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={roleId === '' || roleId === currentRoleId || saving}
          >
            {saving ? 'Salvando…' : 'Salvar perfil'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
