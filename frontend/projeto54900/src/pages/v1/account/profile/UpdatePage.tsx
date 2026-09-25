// Self-service "Editar Perfil": carrega o proprio user_profiles (GET
// user-profiles/me) e grava via PUT user-profiles/update/{id} — o backend
// (Services/V1/User/UserProfiles/Processor::update) restringe nao-admin ao
// proprio registro, entao este formulario so pode mesmo editar o do usuario
// logado. Apos salvar, refreshUser() sincroniza o full_name exibido na Navbar.

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/http';
import { userProfilesMe, userProfilesTable } from '@/services/v1';
import { normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { toText } from '@/utils/format';
import { formDataToPayload, errorDetail } from '@/utils/formSubmit';

function buildSchema(profile: ApiRow): FormGridSchema {
  return {
    rows: [
      {
        fields: [
          {
            col: 12,
            label: 'Nome completo',
            id: 'name',
            name: 'name',
            required: true,
            maxLength: 255,
            defaultValue: toText(profile.name, ''),
          },
        ],
      },
      {
        fields: [
          {
            col: 6,
            label: 'Telefone',
            id: 'phone',
            name: 'phone',
            maxLength: 20,
            defaultValue: toText(profile.phone, ''),
          },
          {
            col: 6,
            label: 'WhatsApp',
            id: 'whatsapp',
            name: 'whatsapp',
            maxLength: 20,
            defaultValue: toText(profile.whatsapp, ''),
          },
        ],
      },
      {
        fields: [
          {
            col: 6,
            label: 'Email',
            id: 'email',
            name: 'email',
            maxLength: 255,
            defaultValue: toText(profile.email, ''),
          },
          {
            col: 6,
            label: 'CPF',
            id: 'cpf',
            name: 'cpf',
            maxLength: 14,
            defaultValue: toText(profile.cpf, ''),
          },
        ],
      },
      {
        fields: [
          {
            col: 4,
            label: 'CEP',
            id: 'cep',
            name: 'cep',
            maxLength: 9,
            defaultValue: toText(profile.cep, ''),
          },
          {
            col: 8,
            label: 'Endereço',
            id: 'address',
            name: 'address',
            maxLength: 255,
            defaultValue: toText(profile.address, ''),
          },
        ],
      },
    ],
  };
}

export default function UpdatePage() {
  const toast = useToast();
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<ApiRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userProfilesMe();
      const row = normalizeItem<ApiRow>(res);
      if (!row) {
        setError('Perfil não encontrado para o usuário autenticado.');
        return;
      }
      setProfile(row);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity() || !profile) {
        el.reportValidity();
        return;
      }
      const payload = formDataToPayload(el);
      setSubmitting(true);
      try {
        await userProfilesTable.update(profile.id as string | number, payload);
        await refreshUser();
        toast.success('Perfil atualizado.', { title: 'Editar perfil' });
        void load();
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
    [profile, refreshUser, toast, load],
  );

  return (
    <>
      <PageHeader title="Editar perfil" subtitle="PUT api/v1/user-profiles/update" />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Perfil indisponível" description={error} variant="danger" />}

      {!loading && !error && profile && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={buildSchema(profile)} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
