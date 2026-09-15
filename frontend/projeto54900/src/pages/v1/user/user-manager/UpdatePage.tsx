// Formulario de edicao de usuario — dirigido pelo build 'atualizar-usuario'
// (form_manager/form_groups/form_rows/form_fields), montado via /v1/form-constructor.
// Mesmo pipeline get-grouped -> buildRenderSchema -> FormGrid do FormRendererPage/
// RegisterPage, com um passo a mais: pre-preenche defaultValue de cada campo com
// o registro atual (userManagerTable.get(id)) antes de montar o <FormGrid>.
//
// O envio usa userManagerTable.update(id, payload) (PUT api/v1/user-manager/update/{id})
// em vez do submit_endpoint estatico do form_manager — a rota real tem o id na URL,
// que o resource ja resolve. password_hash nao entra no build: UpdateRequest.php
// (backend) nao aceita alterar senha por esta rota (fluxo dedicado).

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

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

const FORM_SLUG = 'atualizar-usuario';

function toStr(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v);
}

// Preenche o defaultValue de cada campo do build com o valor atual do registro
// (por nome do campo). Campos sem correspondencia no registro ficam como estao.
function applyValues(schema: FormGridSchema, values: ApiRow): FormGridSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((f) => {
        // checkbox tem defaultValue: string[] — este build nao usa o tipo, pula por seguranca.
        if (f.type === 'checkbox') return f;
        const v = f.name ? toStr(values[f.name]) : undefined;
        return v === undefined ? f : { ...f, defaultValue: v };
      }),
    })),
  };
}

export default function UpdatePage() {
  const { id = '' } = useParams();
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
      const [defRaw, itemRaw] = await Promise.all([
        formManagerView.getGrouped(
          { fm_slug: [FORM_SLUG] },
          { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
        ),
        userManagerTable.get(id),
      ]);

      const { rows } = normalizeList(defRaw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setSchema(null);
        setError(`Nenhum formulario publicado para a slug "${FORM_SLUG}".`);
        return;
      }

      const record = normalizeItem<ApiRow>(itemRaw);
      if (!record) {
        setForm(null);
        setSchema(null);
        setError(`Usuario #${id} nao encontrado.`);
        return;
      }

      setForm(built);
      setSchema(applyValues(built.schema, record));
    } catch (err) {
      setForm(null);
      setSchema(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
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
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }

      const payload = formDataToPayload(el);
      setSubmitting(true);
      try {
        await userManagerTable.update(id, payload);
        toast.success('Usuario atualizado.', { title: form?.meta.title ?? 'Atualizacao' });
        navigate(paths.v1.user.view(id));
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
    [id, form, navigate, toast],
  );

  return (
    <>
      <PageHeader
        title={`Editar usuario #${id}`}
        subtitle={`PUT api/v1/user-manager/update/${id}`}
      >
        <Link className="btn btn-outline-secondary" to={paths.v1.user.view(id)}>
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
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setReloadKey((k) => k + 1)}
                >
                  Desfazer alteracoes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
