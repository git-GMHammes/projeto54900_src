// Formulario de edicao de usuario — build 'atualizar-usuario' (form_manager
// id 19, tabela user_profiles): copia do build 'dados-do-usuario' (etapa 2 do
// cadastro, pages/v1/user/user-profiles/CreatePage.tsx) com submit
// PUT /api/v1/user-profiles/update/{uc_id}. Mesmo pipeline de CreatePage.tsx
// (formManagerView.getGrouped -> buildRenderSchema -> FormGrid), mais o
// preload via userManagerView.get(id) (view_user_manager, colunas uc_* do
// profile) para pre-preencher os campos. Usuario sem profile (uc_id nulo)
// nao tem o que atualizar: a tela manda para a etapa 2 do cadastro.

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
import { formManagerView, userManagerView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { toText } from '@/utils/format';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

const SLUG = 'atualizar-usuario';

// Campo do build (field_name) -> coluna da view_user_manager.
const FIELD_FROM_VIEW: Record<string, string> = {
  uuid: 'uc_uuid',
  name: 'uc_name',
  cpf: 'uc_cpf',
  whatsapp: 'uc_whatsapp',
  phone: 'uc_phone',
  email: 'uc_email',
  cep: 'uc_cep',
  address: 'uc_address',
};

// Preenche defaultValue dos campos cujo nome tem valor no registro
// pre-carregado. So tipos com defaultValue string (os do build: text, cpf,
// phone, email, cep; + password/select); checkbox/radio (string[]) e demais
// ficam como estao, assim como campo sem valor correspondente.
function prefillFromRecord(schema: FormGridSchema, values: Record<string, string>): FormGridSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((f) => {
        const value = f.name ? values[f.name] : undefined;
        if (value === undefined || value === '') return f;
        if (f.type === 'select') return { ...f, defaultValue: value, values: [value] };
        if (
          f.type === undefined ||
          f.type === 'text' ||
          f.type === 'password' ||
          f.type === 'cpf' ||
          f.type === 'phone' ||
          f.type === 'email' ||
          f.type === 'cep'
        ) {
          return { ...f, defaultValue: value };
        }
        return f;
      }),
    })),
  };
}

export default function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [profileId, setProfileId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [formRaw, userRaw] = await Promise.all([
        formManagerView.getGrouped({ fm_slug: [SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' }),
        userManagerView.get(id),
      ]);
      const { rows } = normalizeList(formRaw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setError(`Formulario "${SLUG}" nao esta publicado.`);
        return;
      }
      const user = normalizeItem<ApiRow>(userRaw);
      setProfileId(user ? toText(user.uc_id, '') : '');

      const values: Record<string, string> = { user_manager_id: id };
      if (user) {
        for (const [field, column] of Object.entries(FIELD_FROM_VIEW)) {
          values[field] = toText(user[column], '');
        }
      }
      setForm({ meta: built.meta, schema: prefillFromRecord(built.schema, values) });
    } catch (err) {
      setForm(null);
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
      if (!el.checkValidity() || !id || !profileId) {
        el.reportValidity();
        return;
      }
      if (!form?.meta.submitEndpoint) {
        toast.error('Formulario sem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const payload = formDataToPayload(el);
      const send = senderFor(form.meta.httpMethod);
      // O {id} do update e o do profile (user_profiles.id = uc_id), nao o do usuario.
      const path = `${resolveEndpoint(form.meta.submitEndpoint)}/${profileId}`;

      setSubmitting(true);
      try {
        await send(path, payload);
        toast.success('Usuario atualizado.', { title: form.meta.title });
        void navigate(paths.v1.user.view(id));
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
    [form, id, profileId, navigate, toast],
  );

  return (
    <>
      <PageHeader
        title={form?.meta.title ?? `Editar usuario #${id ?? ''}`}
        subtitle={form?.meta.description || 'PUT api/v1/user-profiles/update'}
      />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} variant="danger" />}

      {!loading && !error && form && !profileId && id && (
        <EmptyState
          variant="warning"
          title="Este usuario ainda nao tem dados de perfil"
          description="Nao ha registro em user_profiles para atualizar. Complete os dados pela etapa 2 do cadastro."
        >
          <Link className="btn btn-primary" to={`${paths.v1.user.profilesCreate}?user_manager_id=${id}`}>
            Completar dados
          </Link>
        </EmptyState>
      )}

      {!loading && !error && form && profileId && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={form.schema} />
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
