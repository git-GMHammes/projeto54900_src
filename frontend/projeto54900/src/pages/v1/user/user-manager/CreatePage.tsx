// Formulario de criacao de usuario — dirigido pelo build 'cadastro-usuario'
// (form_manager/form_groups/form_rows/form_fields), o mesmo que o passo 1
// (Login) do RegisterPage.tsx usa. Mesmo pipeline get-grouped ->
// buildRenderSchema -> FormGrid do FormRendererPage, aqui fixo na slug do
// modulo (nao generico por URL) e com submit tipado via userManagerTable.

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView, userManagerTable } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

const FORM_SLUG = 'cadastro-usuario';

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<RenderForm | null>(null);
  const [schema, setSchema] = useState<FormGridSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await formManagerView.getGrouped(
        { fm_slug: [FORM_SLUG] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
      );
      const { rows } = normalizeList(raw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setSchema(null);
        setError(`Nenhum formulario publicado para a slug "${FORM_SLUG}".`);
        return;
      }
      setForm(built);
      setSchema(built.schema);
    } catch (err) {
      setForm(null);
      setSchema(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
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
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }

      const payload = formDataToPayload(el);
      setSubmitting(true);
      try {
        const res = await userManagerTable.create(payload);
        const row = normalizeItem<ApiRow>(res);
        const id = row?.id;
        toast.success('Usuario criado.', { title: form?.meta.title ?? 'Novo usuario' });
        if (typeof id === 'string' || typeof id === 'number') {
          navigate(paths.v1.user.view(id));
        } else {
          navigate(paths.v1.user.list);
        }
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
    [form, navigate, toast],
  );

  return (
    <>
      <PageHeader title="Novo usuario" subtitle="POST api/v1/user-manager/create">
        <Link className="btn btn-outline-secondary" to={paths.v1.user.list}>
          Voltar
        </Link>
      </PageHeader>

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {!loading && !error && schema && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <form key={reloadKey} onSubmit={(e) => void handleSubmit(e)} noValidate>
              <FormGrid schema={schema} />
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Criando...' : 'Criar'}
                </button>
                <button type="reset" className="btn btn-outline-secondary" onClick={() => setReloadKey((k) => k + 1)}>
                  Limpar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
