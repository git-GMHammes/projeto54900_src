// Edicao de permissao individual (user_resource_access): usuario, tipo e recurso sao a
// identidade da permissao e aparecem travados; so o campo "Acesso" (permitir/negar)
// muda. Para trocar o recurso, exclua e cadastre outra. So admin.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { userResourceAccessTable, userResourceAccessView } from '@/services/v1';
import { normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { toText } from '@/utils/format';
import { errorDetail } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

export default function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [record, setRecord] = useState<ApiRow | null>(null);
  const [allowed, setAllowed] = useState('1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const row = normalizeItem<ApiRow>(await userResourceAccessView.get(id));
      if (!row) {
        setError('Permissão não encontrada.');
        return;
      }
      setRecord(row);
      setAllowed(toText(row.ura_allowed, '1') === '0' ? '0' : '1');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar a permissão.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const schema = useMemo<FormGridSchema | null>(() => {
    if (!record) return null;
    const isForm = toText(record.ura_resource_type, 'form') === 'form';
    const user = `${toText(record.uc_name, '')} (${toText(record.um_username, '')})`.trim();
    const resource = `${toText(record.resource_title, '')} (${toText(record.resource_slug, '')})`.trim();

    return {
      rows: [
        {
          fields: [
            { col: 6, label: 'Usuário', defaultValue: user, disabled: true },
            { col: 6, label: 'Tipo', defaultValue: isForm ? 'Formulário' : 'Listagem', disabled: true },
          ],
        },
        {
          fields: [
            { col: 8, label: isForm ? 'Formulário' : 'Listagem', defaultValue: resource, disabled: true },
            {
              type: 'select',
              col: 4,
              label: 'Acesso',
              name: 'allowed',
              required: true,
              labelKey: 'label',
              options: [
                { id: 'allow', label: 'Permitir', value: '1' },
                { id: 'deny', label: 'Negar', value: '0' },
              ],
              value: allowed,
              onChange: (value) => setAllowed(value),
            },
          ],
        },
      ],
    };
  }, [record, allowed]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!id) return;
      setSubmitting(true);
      try {
        await userResourceAccessTable.update(id, { allowed: Number(allowed) });
        toast.success('Permissão atualizada.', { title: 'Acesso individual' });
        void navigate(paths.v1.userResourceAccess.list);
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
    [id, allowed, navigate, toast],
  );

  return (
    <>
      <PageHeader title={`Editar permissão #${id ?? ''}`} subtitle="PUT api/v1/user-resource-access/update" />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Permissão indisponível" description={error} variant="danger" />}

      {!loading && !error && schema && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={schema} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => void navigate(paths.v1.userResourceAccess.list)}
            >
              Voltar
            </button>
          </div>
        </form>
      )}
    </>
  );
}
