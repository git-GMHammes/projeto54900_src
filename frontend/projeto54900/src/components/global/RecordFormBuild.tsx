// Componente global reutilizavel: CADASTRO ou EDICAO de um registro por um
// formulario do banco (form_manager), identificado por SLUG via PROPS -- nao le
// useParams() e nao conhece nenhum modulo. As paginas CreatePage/UpdatePage sao
// apenas wrappers: informam o slug, o caminho de "Voltar" e, na edicao, o id e como
// buscar o registro.
//
// Pipeline (igual ao das paginas de messages): formManagerView -> buildRenderSchema
// -> FormGrid -> submit JSON no submit_endpoint do form. Na edicao o id vai no fim
// do endpoint (PUT .../update/{id}) e os campos vem preenchidos pelo registro.
//
// Antes de montar, pergunta ao backend se o usuario da sessao pode abrir o form
// (checkResourceAccess: admin libera; linha individual em user_resource_access vale;
// senao vale form_manager.roles) -- acesso negado vira EmptyState.
//
// Os props "vivos" (defaults, toValues, patches) ficam em ref: nao disparam novo
// carregamento quando o pai recria o objeto a cada render.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import FakeFillButton from '@/components/global/FakeFillButton';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useGoBack } from '@/hooks/useGoBack';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView, checkResourceAccess, isDenied } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { fillValues, patchFields } from '@/utils/formSchemaPatch';
import type { FieldPatch } from '@/utils/formSchemaPatch';
import { stampedSlug } from '@/utils/slug';

export interface RecordFormBuildProps {
  /** Slug do form_manager. */
  slug: string;
  /** Para onde o sucesso leva (normalmente a lista do recurso); "Voltar" volta a ultima tela e usa este caminho como reserva. */
  backPath: string;
  /** Presente = modo edicao. */
  recordId?: string;
  /** Busca o registro (edicao): ex. `(id) => companiesTable.get(id)`. */
  loadRecord?: (id: string) => Promise<unknown>;
  /** Registro -> valores iniciais por `field.name` (edicao). */
  toValues?: (record: ApiRow) => Record<string, string>;
  /** Valores iniciais fixos (cadastro). */
  defaults?: Record<string, string>;
  /** Remendos por `field.name` (ex.: `{ campo: { disabled: true } }`). */
  patches?: Record<string, FieldPatch>;
  /**
   * Cadastro: preenche o campo `to` (slug) enquanto se digita o campo `from` (titulo/nome), no
   * formato `slug-do-texto_AAAAMMDDHHMMSS`. Para de acompanhar se o usuario editar o slug a mao
   * (voltar a apagar o slug religa o automatico). So no cadastro; na edicao nada muda.
   */
  autoSlug?: { from: string; to: string };
  successMessage: string;
  fallbackTitle: string;
}

export default function RecordFormBuild({
  slug,
  backPath,
  recordId,
  loadRecord,
  toValues,
  defaults,
  patches,
  autoSlug,
  successMessage,
  fallbackTitle,
}: RecordFormBuildProps) {
  const navigate = useNavigate();
  const goBack = useGoBack(backPath);
  const toast = useToast();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const live = useRef({ loadRecord, toValues, defaults, patches });
  live.current = { loadRecord, toValues, defaults, patches };

  const editing = recordId !== undefined;

  // Slug automatico (cadastro): `slugTouched` = o usuario mexeu no slug; `settingSlug` = mudanca feita por nos.
  const slugTouched = useRef(false);
  const settingSlug = useRef(false);

  const handleInput = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      if (!autoSlug || editing) return;
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;

      if (input.name === autoSlug.to) {
        if (!settingSlug.current) slugTouched.current = input.value.trim() !== '';
        return;
      }

      if (input.name !== autoSlug.from || slugTouched.current) return;

      const target = event.currentTarget.elements.namedItem(autoSlug.to);
      if (!(target instanceof HTMLInputElement)) return;

      // Escreve pelo setter nativo e avisa o React/FormGrid, como se tivesse sido digitado.
      settingSlug.current = true;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(target, stampedSlug(input.value));
      target.dispatchEvent(new Event('input', { bubbles: true }));
      settingSlug.current = false;
    },
    [autoSlug, editing],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const access = await checkResourceAccess('form', { slug });
      if (isDenied(access)) {
        setForm(null);
        setError('Você não tem acesso a este formulário.');
        return;
      }

      const { loadRecord: fetchRecord, toValues: mapRecord } = live.current;
      const [formRaw, recordRaw] = await Promise.all([
        formManagerView.getGrouped({ fm_slug: [slug] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' }),
        recordId !== undefined && fetchRecord ? fetchRecord(recordId) : Promise.resolve(null),
      ]);
      const built = buildRenderSchema(normalizeList(formRaw).rows);
      if (!built) {
        setForm(null);
        setError(`Formulario "${slug}" nao esta publicado.`);
        return;
      }

      if (recordId !== undefined && fetchRecord) {
        const record = normalizeItem<ApiRow>(recordRaw);
        if (!record) {
          setForm(null);
          setError('Registro não encontrado.');
          return;
        }
        setValues(mapRecord ? mapRecord(record) : {});
      }
      setForm(built);
    } catch (err) {
      setForm(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulário.');
    } finally {
      setLoading(false);
    }
  }, [slug, recordId]);

  useEffect(() => {
    void load();
  }, [load]);

  const schema = useMemo(() => {
    if (!form) return null;
    const initial = editing ? values : (live.current.defaults ?? {});
    const filled = fillValues(form.schema, initial);
    const extra = live.current.patches;

    return extra ? patchFields(filled, extra) : filled;
  }, [form, editing, values]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
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
      const send = senderFor(form.meta.httpMethod);
      const base = resolveEndpoint(form.meta.submitEndpoint);
      const path = editing ? `${base}/${recordId}` : base;

      setSubmitting(true);
      try {
        await send(path, payload);
        toast.success(successMessage, { title: form.meta.title });
        void navigate(backPath);
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
    [form, editing, recordId, successMessage, backPath, navigate, toast],
  );

  return (
    <>
      <PageHeader title={form?.meta.title ?? fallbackTitle} subtitle={form?.meta.description ?? slug} />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} variant="danger" />}

      {!loading && !error && schema && (
        <form onSubmit={(e) => void handleSubmit(e)} onInput={handleInput} noValidate>
          <FormGrid schema={schema} />
          {/* Dev-only (isDevHost) e so no cadastro: so aparece se houver script registrado para o slug. */}
          {!editing && <FakeFillButton slug={slug} />}
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : editing ? 'Salvar' : 'Enviar'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={goBack}>
              Voltar
            </button>
          </div>
        </form>
      )}
    </>
  );
}
