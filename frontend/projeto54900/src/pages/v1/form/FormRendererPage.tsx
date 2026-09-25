// Renderizador de formulario — le a definicao de um form_manager pela slug da
// URL (/v1/form/:slug), monta UM formulario com <FormGrid> a partir da
// view_form_manager e submete para o endpoint / metodo gravados no registro.
//
// Irmao de FormConstructorPage (/v1/form-constructor-claude): mesmo pipeline
// get-grouped -> formSchema -> FormGrid, aqui generico e dirigido pelos dados.
// Alvo inicial: slug "calendario" -> POST /api/v1/calendar-manager/create
// (modulo Calendar, espelho do Google Calendar).

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import MonthCalendar from '@/components/ui/MonthCalendar';
import YearCalendar from '@/components/ui/YearCalendar';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import Modal from '@/components/global/Modal';
import FakeFillButton from '@/components/global/FakeFillButton';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema, isFormPublished } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

// Slug com guard proprio: SOMENTE ADMIN (menu_manager.roles=["admin"] para
// /v1/form/calendario) — os demais slugs deste renderizador generico
// continuam abertos a qualquer autenticado (ex.: 'cadastro-usuario').
const ADMIN_ONLY_SLUGS = ['calendario'];

export default function FormRendererPage() {
  const { slug = '' } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await formManagerView.getGrouped(
        { fm_slug: [slug] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
      );
      const { rows } = normalizeList(raw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setError(`Nenhum formulario publicado para a slug "${slug}".`);
        return;
      }
      setForm(built);
    } catch (err) {
      setForm(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!form?.meta.submitEndpoint) {
        toast.error('Este formulario nao tem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const el = event.currentTarget;
      const payload = formDataToPayload(el);
      const send = senderFor(form.meta.httpMethod);
      const path = resolveEndpoint(form.meta.submitEndpoint);

      setSubmitting(true);
      try {
        await send(path, payload);
        toast.success('Registro enviado.', { title: form.meta.title });
        el.reset();
        setReloadKey((k) => k + 1);
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
    [form, toast],
  );

  if (ADMIN_ONLY_SLUGS.includes(slug) && user?.role?.slug !== 'admin') {
    return <Navigate to={paths.forbidden} replace />;
  }

  return (
    <>
      <PageHeader
        title={form?.meta.title ?? 'Formulario'}
        subtitle={form?.meta.description ?? `slug: ${slug}`}
      >
        <Link className="btn btn-outline-secondary me-2" to={paths.v1.form.list}>
          Voltar
        </Link>
        <button className="btn btn-outline-secondary" onClick={() => void load()} disabled={loading}>
          Recarregar
        </button>
      </PageHeader>

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {/* Bloco exclusivo da slug "calendario" — FormRendererPage continua generica para as demais. */}
      {slug === 'calendario' && !loading && (
        <>
          <MonthCalendar
            year={new Date().getFullYear()}
            month={new Date().getMonth()}
            size="lg"
            className="mb-4"
          />

          <div className="mb-4">
            <h2 className="h5 mb-3">Ano completo</h2>
            <YearCalendar year={new Date().getFullYear()} />
          </div>
        </>
      )}

      {!loading && !error && form && (
        <button type="button" className="btn btn-primary mb-4" onClick={() => setShowFormModal(true)}>
          Preencher formulário
        </button>
      )}

      {showFormModal && form && <FakeFillButton slug={slug} />}

      <Modal
        open={showFormModal && !!form}
        title={form?.meta.title}
        onClose={() => setShowFormModal(false)}
        size="lg"
      >
        {form && !isFormPublished(form) && (
          <div className="alert alert-warning py-2">
            Formulario com status <strong>{form.meta.status ?? 'draft'}</strong> — ainda nao publicado.
          </div>
        )}

        {form && (
          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            <FormGrid key={reloadKey} schema={form.schema} />
            <div className="d-flex gap-2 mt-4 pt-3 border-top">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
              <button type="reset" className="btn btn-outline-secondary">
                Limpar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
