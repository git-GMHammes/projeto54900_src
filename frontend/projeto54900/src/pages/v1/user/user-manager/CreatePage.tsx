// Formulario de criacao de usuario — ETAPA 1 (build 'cadastro-usuario', tabela
// user_manager: username + password). Ao criar, pega o id retornado e manda
// para /v1/user-profiles/create?user_manager_id={id} (etapa 2, pagina propria
// do modulo user-profiles). Mesmo pipeline de FormRendererPage.tsx:
// formManagerView.getGrouped -> buildRenderSchema -> FormGrid -> submit para
// o submit_endpoint do build. Ver src/markdown/geral/README_FormGrid.md.

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { companySlug } from '@/config/env';
import { ApiError, http } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';
import PasswordHashPreviewButton from './PasswordHashPreviewButton';
import TermsModal from './TermsModal';

const SLUG = 'cadastro-usuario';
const COMPANIES_PATH = '/v1/company-manager-public/get-no-pagination';

/** Pre-seleciona no select Empresa (company_ids) a empresa do endereco; sem slug ou sem casamento, nao altera o form. */
async function withCompanyFromUrl(form: RenderForm): Promise<RenderForm> {
  if (!companySlug) return form;
  try {
    const { rows } = normalizeList(await http.get(COMPANIES_PATH));
    const match = rows.find((row) => row.slug === companySlug);
    const id = match?.id;
    if (typeof id !== 'string' && typeof id !== 'number') return form;
    const companyId = String(id);
    return {
      ...form,
      schema: {
        rows: form.schema.rows.map((row) => ({
          ...row,
          fields: row.fields.map((field) =>
            field.type === 'select' && field.name === 'company_ids' ? { ...field, defaultValue: companyId } : field,
          ),
        })),
      },
    };
  } catch {
    return form;
  }
}

/** Todos os campos em largura total do contenedor centralizado, para ficarem com a mesma largura (col do banco varia por campo). */
function withFullWidthFields(form: RenderForm): RenderForm {
  return {
    ...form,
    schema: {
      rows: form.schema.rows.map((row) => ({
        ...row,
        fields: row.fields.map((field) => ({ ...field, col: 12 as const })),
      })),
    },
  };
}

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [termsOpen, setTermsOpen] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await formManagerView.getGrouped(
        { fm_slug: [SLUG] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
      );
      const { rows } = normalizeList(raw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setError(`Formulario "${SLUG}" nao esta publicado.`);
        return;
      }
      setForm(withFullWidthFields(await withCompanyFromUrl(built)));
    } catch (err) {
      setForm(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulário.');
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
      if (!accepted) {
        setTermsOpen(true);
        return;
      }
      const el = event.currentTarget;
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }
      if (!form?.meta.submitEndpoint) {
        toast.error('Formulario sem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const payload = formDataToPayload(el);
      // Select de escolha unica entrega o id escalar; a API espera company_ids como lista.
      if (typeof payload.company_ids === 'string') payload.company_ids = [payload.company_ids];
      const send = senderFor(form.meta.httpMethod);
      const path = resolveEndpoint(form.meta.submitEndpoint);

      setSubmitting(true);
      try {
        const res = await send(path, payload);
        const row = normalizeItem<ApiRow>(res);
        const id = row?.id;
        if (typeof id !== 'string' && typeof id !== 'number') {
          toast.error('Registro criado sem id na resposta.', { title: 'Erro ao enviar' });
          return;
        }
        toast.success('Usuário criado.', { title: form.meta.title });
        void navigate(`${paths.v1.user.profilesCreate}?user_manager_id=${id}`);
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
    [accepted, form, navigate, toast],
  );

  return (
    <>
      <PasswordHashPreviewButton />
      <PageHeader
        title={form?.meta.title ?? 'Novo usuário'}
        subtitle={form?.meta.description ?? 'POST api/v1/user-manager/create'}
      />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {!loading && !error && form && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="row">
            <div className="col-md-6 col-lg-4 mx-auto">
              <FormGrid schema={form.schema} />
            </div>
          </div>
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting || !accepted}>
              {submitting ? 'Criando...' : 'Criar'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.user.list)}>
              Voltar
            </button>
            {!accepted && !termsOpen && (
              <button type="button" className="btn btn-link align-self-center" onClick={() => setTermsOpen(true)}>
                Ler e aceitar os termos de uso
              </button>
            )}
          </div>
        </form>
      )}

      <TermsModal
        open={termsOpen}
        accepted={accepted}
        onAcceptedChange={setAccepted}
        onClose={() => setTermsOpen(false)}
      />
    </>
  );
}
