// Create de Empresas <-> Membros: modal em 2 etapas (espelho do CreateModal de grupos).
//   Etapa 1 — formulario 'criar-empresa' (mesmo do cadastro de empresa): cria a empresa.
//   Etapa 2 — o mesmo editor de dois cards da UpdatePage, com a empresa recem-criada fixa, para
//             colocar os usuarios nela (Salvar = PUT company-members/sync/{id}).
// Se a etapa 1 grava e a 2 falha, a empresa continua criada: o modal avisa e a etapa 2 pode ser
// refeita aqui mesmo ou depois pela tela de edicao.
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import Modal from '@/components/global/Modal';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView, checkResourceAccess, isDenied } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { fillValues } from '@/utils/formSchemaPatch';
import CompanyMembersEditor from './CompanyMembersEditor';

const SLUG = 'criar-empresa';

export interface CreateModalProps {
  open: boolean;
  /** Fecha o modal; `changed` = alguma empresa foi criada (a lista deve recarregar). */
  onClose: (changed: boolean) => void;
}

export default function CreateModal({ open, onClose }: CreateModalProps) {
  const toast = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [createdId, setCreatedId] = useState('');
  const [companiesVersion, setCompaniesVersion] = useState(0);
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Acesso individual ao formulario (user_resource_access / roles).
      if (isDenied(await checkResourceAccess('form', { slug: SLUG }))) {
        setForm(null);
        setError('Voce nao tem acesso a este formulario.');
        return;
      }
      const raw = await formManagerView.getGrouped({ fm_slug: [SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' });
      const built = buildRenderSchema(normalizeList(raw).rows);
      if (!built) {
        setForm(null);
        setError(`Formulario "${SLUG}" nao esta publicado.`);
        return;
      }
      setForm(built);
    } catch (err) {
      setForm(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Ao abrir: volta para a etapa 1 e carrega o formulario.
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setCreatedId('');
    void load();
  }, [open, load]);

  const schema = useMemo(() => (form ? fillValues(form.schema, { status: 'active' }) : null), [form]);

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

      setSubmitting(true);
      try {
        const res = await send(resolveEndpoint(form.meta.submitEndpoint), payload);
        const id = normalizeItem<ApiRow>(res)?.id;
        if (typeof id !== 'string' && typeof id !== 'number') {
          toast.error('Empresa criada sem id na resposta.', { title: 'Erro ao enviar' });
          return;
        }

        toast.success('Empresa criada. Agora escolha os membros.', { title: form.meta.title });
        setCreatedId(String(id));
        setCompaniesVersion((v) => v + 1);
        setStep(2);
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

  return (
    <Modal
      open={open}
      size="xl"
      title={step === 1 ? 'Nova empresa — etapa 1 de 2: dados da empresa' : 'Nova empresa — etapa 2 de 2: membros'}
      onClose={() => onClose(createdId !== '')}
    >
      {step === 1 && (
        <>
          {loading && <LoadingOverlay />}
          {error && !loading && <EmptyState title="Formulario indisponivel" description={error} variant="danger" />}
          {!loading && !error && schema && (
            <form onSubmit={(e) => void handleSubmit(e)} noValidate>
              <FormGrid schema={schema} />
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Criando...' : 'Criar e escolher membros'}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => onClose(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <CompanyMembersEditor companyId={createdId} companiesVersion={companiesVersion} />
          <div className="d-flex justify-content-end mt-3 pt-3 border-top">
            <button type="button" className="btn btn-outline-secondary" onClick={() => onClose(true)}>
              Concluir
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
