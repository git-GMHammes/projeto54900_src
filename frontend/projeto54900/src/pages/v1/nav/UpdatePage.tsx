// Formulario de edicao de nav — schema FormGrid escrito a mao, com preload
// via navManagerTable.get(id). Unico form (alem do create) que expoe status.

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { navManagerTable } from '@/services/v1';
import { normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { toText } from '@/utils/format';
import { formDataToPayload, errorDetail } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

function buildSchema(nav: ApiRow): FormGridSchema {
  return {
    rows: [
      {
        fields: [
          {
            col: 12,
            label: 'Titulo',
            id: 'title',
            name: 'title',
            required: true,
            maxLength: 255,
            defaultValue: toText(nav.title, ''),
          },
        ],
      },
      {
        fields: [
          {
            col: 6,
            label: 'Imagem (URL)',
            id: 'image',
            name: 'image',
            maxLength: 500,
            defaultValue: toText(nav.image, ''),
          },
          {
            col: 6,
            label: 'Icone de mensagens',
            id: 'message_icon',
            name: 'message_icon',
            maxLength: 64,
            defaultValue: toText(nav.message_icon, ''),
          },
        ],
      },
      {
        fields: [
          {
            col: 6,
            label: 'Versao do sistema',
            id: 'system_version',
            name: 'system_version',
            maxLength: 20,
            defaultValue: toText(nav.system_version, ''),
          },
          {
            type: 'select',
            col: 6,
            label: 'Status',
            id: 'status',
            name: 'status',
            required: true,
            options: [
              { id: 'draft', value: 'draft', label: 'Rascunho' },
              { id: 'active', value: 'active', label: 'Ativo' },
              { id: 'inactive', value: 'inactive', label: 'Inativo' },
            ],
            valueKey: 'value',
            labelKey: 'label',
            values: [toText(nav.status, 'draft')],
          },
        ],
      },
    ],
  };
}

export default function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [nav, setNav] = useState<ApiRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await navManagerTable.get(id);
      const row = normalizeItem<ApiRow>(res);
      if (!row) {
        setError('Nav nao encontrado.');
        return;
      }
      setNav(row);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o nav.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity() || !id) {
        el.reportValidity();
        return;
      }
      const payload = formDataToPayload(el);
      setSubmitting(true);
      try {
        await navManagerTable.update(id, payload);
        toast.success('Nav atualizado.', { title: 'Editar nav' });
        void navigate(paths.v1.nav.view(id));
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
    [id, navigate, toast],
  );

  return (
    <>
      <PageHeader title={`Editar nav #${id ?? ''}`} subtitle="PUT api/v1/nav-manager/update" />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Nav indisponivel" description={error} variant="danger" />}

      {!loading && !error && nav && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={buildSchema(nav)} />
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
