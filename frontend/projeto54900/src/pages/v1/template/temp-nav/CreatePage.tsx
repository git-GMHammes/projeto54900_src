// Formulario de criacao de nav — schema FormGrid escrito a mao (temp_nav
// nao tem build no form_manager, e um CRUD direto). status nao entra aqui:
// nasce 'draft' pelo DEFAULT da coluna (Processor::prepareData faz unset).

import { useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { tempNavTable } from '@/services/v1';
import { normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail } from '@/utils/formSubmit';
import { env } from '@/config/env';
import { paths } from '@/routes/paths';

const COMPANY_SRC = `${env.apiBaseUrl}/v1/company-manager/get-no-pagination`;

const SCHEMA: FormGridSchema = {
  rows: [
    {
      fields: [
        { col: 12, label: 'Título', id: 'title', name: 'title', required: true, maxLength: 255 },
      ],
    },
    {
      fields: [
        { col: 6, label: 'Imagem (URL)', id: 'image', name: 'image', maxLength: 500 },
        { col: 6, label: 'Icone de mensagens', id: 'message_icon', name: 'message_icon', maxLength: 64 },
      ],
    },
    {
      fields: [
        {
          col: 6,
          label: 'Versão do sistema',
          id: 'system_version',
          name: 'system_version',
          defaultValue: '1.0.0',
          maxLength: 20,
        },
      ],
    },
    {
      fields: [
        {
          type: 'select',
          col: 12,
          label: 'Empresas (opcional)',
          title: 'Slugs das empresas que enxergam o nav. Vazio = a empresa da sessão.',
          name: 'company_manager[]',
          multiple: true,
          src: COMPANY_SRC,
          valueKey: 'slug',
          labelKey: 'name',
        },
      ],
    },
  ],
};

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }
      const payload = formDataToPayload(el);
      try {
        const res = await tempNavTable.create(payload);
        const row = normalizeItem<ApiRow>(res);
        toast.success('Nav criado.', { title: 'Novo nav' });
        void navigate(row?.id !== undefined ? paths.v1.nav.view(row.id as string | number) : paths.v1.nav.list);
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao enviar' });
        } else {
          toast.error('Falha inesperada ao enviar.', { title: 'Erro ao enviar' });
        }
      }
    },
    [navigate, toast],
  );

  return (
    <>
      <PageHeader title="Novo nav" subtitle="POST api/v1/temp-nav/create" />
      <form onSubmit={(e) => void handleSubmit(e)} noValidate>
        <FormGrid schema={SCHEMA} />
        <div className="d-flex gap-2 mt-4 pt-3 border-top">
          <button type="submit" className="btn btn-primary">
            Criar
          </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.nav.list)}>
              Voltar
            </button>
        </div>
      </form>
    </>
  );
}
