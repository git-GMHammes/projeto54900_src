import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import EmptyState from '@/components/global/EmptyState';
import Modal from '@/components/global/Modal';
import FakeFillButton from '@/components/global/FakeFillButton';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { ApiError, hasAccessToken } from '@/services/http';
import { formManagerView, userManagerTable } from '@/services/v1';
import { buildRenderSchema, isFormPublished } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';

import { CALENDAR_FORM_SLUG, GUEST_USERNAME, UNKNOWN_USERNAME } from './constants';
import { withDefaultValues } from './helpers';

/** Modal "Novo Calendário" — form_manager slug 'calendario', grava via POST. */
export default function CreateCalendarModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const { user, bootstrapping } = useAuth();

  const [form, setForm] = useState<RenderForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ids de 'guest'/'unknown' em user_manager, buscados por username (nunca fixos no código).
  const [fallbackOwners, setFallbackOwners] = useState<{ guest: string; unknown: string }>({ guest: '', unknown: '' });

  useEffect(() => {
    formManagerView
      .getGrouped({ fm_slug: [CALENDAR_FORM_SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' })
      .then((raw) => {
        const { rows } = normalizeList(raw);
        const built = buildRenderSchema(rows);
        setForm(built);
        if (!built) setFormError(`Nenhum formulario publicado para a slug "${CALENDAR_FORM_SLUG}".`);
      })
      .catch((err) => {
        setForm(null);
        setFormError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
      });
  }, []);

  useEffect(() => {
    userManagerTable
      .getNoPagination({ sort: 'id', order: 'ASC' })
      .then((raw) => {
        const { rows } = normalizeList<Record<string, unknown>>(raw);
        const idOf = (username: string) => {
          const id = rows.find((r) => r.username === username)?.id;
          return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
        };
        setFallbackOwners({ guest: idOf(GUEST_USERNAME), unknown: idOf(UNKNOWN_USERNAME) });
      })
      .catch(() => setFallbackOwners({ guest: '', unknown: '' }));
  }, []);

  // Dono padrão do "Novo Calendário": usuário da sessão JWT; sem ele, 'unknown'
  // (há token, mas o usuário não foi resolvido) ou 'guest' (sem sessão).
  const defaultOwnerId = bootstrapping
    ? ''
    : user
      ? String(user.id)
      : hasAccessToken()
        ? fallbackOwners.unknown
        : fallbackOwners.guest;

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
        toast.success('Calendario criado.', { title: form.meta.title });
        el.reset();
        onClose();
        onCreated();
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
    [form, onClose, onCreated, toast],
  );

  return (
    <>
      {open && form && isFormPublished(form) && <FakeFillButton slug={CALENDAR_FORM_SLUG} />}

      <Modal open={open} title={form?.meta.title ?? 'Novo Calendário'} onClose={onClose} size="lg">
        {formError && !form && <EmptyState title="Formulario indisponivel" description={formError} />}

        {form && !isFormPublished(form) && (
          <EmptyState
            title="Formulario indisponivel"
            description={`Status "${form.meta.status ?? 'draft'}" — este formulario ainda nao foi publicado (status "active").`}
          />
        )}

        {form && isFormPublished(form) && (
          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            <FormGrid
              key={defaultOwnerId}
              schema={withDefaultValues(form.schema, { user_manager_id: defaultOwnerId })}
            />
            <div className="d-flex gap-2 mt-4 pt-3 border-top">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Criar'}
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
