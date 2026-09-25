// Modal de reset de senha da lista de seguranca (user-manager/GetAllPage.tsx,
// acao data_action 'reset-password'). O admin digita a nova senha + confirmacao;
// envia PUT /api/v1/user-manager/update/{id} com { password_hash } — o hash
// bcrypt e aplicado no backend (UserManager\Processor::prepareData, que tambem
// descarta password_hash_confirm antes de gravar). Regra de tamanho espelha
// UpdateRequest (min 6, max 255).
//
// Campo via <FormGrid> (type: 'senha', doubleField) — NAO <input> a mao (regra
// do CLAUDE.md do frontend): ganha de graca o botao de revelar/ocultar senha e
// a validacao de confirmacao (SenhaField liga o mismatch a checkValidity()
// nativo, por isso o submit chama checkValidity()/reportValidity() antes de
// enviar, mesmo padrao de LoginPage.tsx). key={userId} no <form> forca reset
// dos campos ao trocar de usuario (Modal so desmonta ao fechar; troca de
// userId com o modal ainda aberto nao passaria por unmount sem a key).

import { useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { userManagerTable } from '@/services/v1';
import { formDataToPayload } from '@/utils/formSubmit';

const MIN_LENGTH = 6;
const MAX_LENGTH = 255;

function buildSchema(): FormGridSchema {
  return {
    rows: [
      {
        fields: [
          {
            type: 'senha',
            col: 12,
            label: 'Nova senha',
            id: 'reset-password',
            name: 'password_hash',
            required: true,
            minLength: MIN_LENGTH,
            maxLength: MAX_LENGTH,
            doubleField: true,
            autoComplete: 'new-password',
            autoFocus: true,
          },
        ],
      },
    ],
  };
}

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
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    if (!el.checkValidity()) {
      el.reportValidity();
      return;
    }
    if (!userId) return;

    const { password_hash } = formDataToPayload(el);
    setSaving(true);
    try {
      await userManagerTable.update(userId, { password_hash });
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
      <form key={userId} onSubmit={(e) => void submit(e)} noValidate>
        <FormGrid schema={buildSchema()} />
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar senha'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
