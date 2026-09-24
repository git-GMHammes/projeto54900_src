// Modal de reset de senha da lista de seguranca (user-manager/GetAllPage.tsx,
// acao data_action 'reset-password'). O admin digita a nova senha + confirmacao;
// envia PUT /api/v1/user-manager/update/{id} com { password_hash } — o hash
// bcrypt e aplicado no backend (UserManager\Processor::prepareUpdateData).
// Regra de tamanho espelha UpdateRequest (min 6, max 255).

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { userManagerTable } from '@/services/v1';

const MIN_LENGTH = 6;
const MAX_LENGTH = 255;

export default function ResetPasswordModal({
  userId,
  username,
  onClose,
  onSaved,
}: {
  /** id do user_manager; null = modal fechado. */
  userId: string | null;
  username: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  // Cada abertura comeca limpa (nao reaproveita senha digitada para outro usuario).
  useEffect(() => {
    setPassword('');
    setConfirm('');
  }, [userId]);

  const tooShort = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && password !== confirm;
  const valid = password.length >= MIN_LENGTH && password.length <= MAX_LENGTH && password === confirm;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId || !valid) return;
    setSaving(true);
    try {
      await userManagerTable.update(userId, { password_hash: password });
      toast.success('Senha atualizada.', { title: username || 'Reset de senha' });
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao atualizar a senha.', { title: 'Reset de senha' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={userId !== null} title={`Reset de senha${username ? `: ${username}` : ''}`} onClose={onClose}>
      <form onSubmit={(e) => void submit(e)} noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="reset-password">Nova senha</label>
          <input
            id="reset-password"
            type="password"
            className={`form-control${tooShort ? ' is-invalid' : ''}`}
            autoComplete="new-password"
            maxLength={MAX_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <div className="invalid-feedback">Mínimo de {MIN_LENGTH} caracteres.</div>
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="reset-password-confirm">Confirmar senha</label>
          <input
            id="reset-password-confirm"
            type="password"
            className={`form-control${mismatch ? ' is-invalid' : ''}`}
            autoComplete="new-password"
            maxLength={MAX_LENGTH}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <div className="invalid-feedback">As senhas não conferem.</div>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={!valid || saving}>
            {saving ? 'Salvando…' : 'Salvar senha'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
