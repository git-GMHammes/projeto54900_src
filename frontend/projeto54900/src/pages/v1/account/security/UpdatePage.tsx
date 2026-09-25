// Self-service "Segurança": troca a propria senha (PUT auth/change-password).
// O backend invalida o token atual ao trocar (user_manager.token NULL) —
// tratamos isso como logout local e mandamos de volta para o login.

import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/http';
import { authService } from '@/services/v1';
import { formDataToPayload, errorDetail } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

const SCHEMA: FormGridSchema = {
  rows: [
    {
      fields: [
        {
          type: 'senha',
          col: 12,
          label: 'Senha atual',
          id: 'current_password',
          name: 'current_password',
          required: true,
          autoComplete: 'current-password',
        },
      ],
    },
    {
      fields: [
        {
          type: 'senha',
          col: 12,
          label: 'Nova senha',
          id: 'new_password',
          name: 'new_password',
          required: true,
          minLength: 6,
          doubleField: true,
          autoComplete: 'new-password',
        },
      ],
    },
  ],
};

export default function UpdatePage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }
      const payload = formDataToPayload(el);
      const currentPassword = typeof payload.current_password === 'string' ? payload.current_password : '';
      const newPassword = typeof payload.new_password === 'string' ? payload.new_password : '';
      setSubmitting(true);
      try {
        await authService.changePassword(currentPassword, newPassword);
        toast.success('Senha alterada. Faça login novamente.', { title: 'Segurança' });
        await logout();
        void navigate(paths.v1.auth.login, { replace: true });
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao enviar' });
        } else {
          toast.error('Falha inesperada ao enviar.', { title: 'Erro ao enviar' });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [logout, navigate, toast],
  );

  return (
    <>
      <PageHeader title="Segurança" subtitle="PUT api/v1/auth/change-password" />

      <form onSubmit={(e) => void handleSubmit(e)} noValidate>
        <FormGrid schema={SCHEMA} />
        <div className="d-flex gap-2 mt-4 pt-3 border-top">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Trocar senha'}
          </button>
        </div>
      </form>
    </>
  );
}
