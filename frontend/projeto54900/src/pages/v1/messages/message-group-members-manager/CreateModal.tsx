// Create de Grupos <-> Membros: modal em 2 etapas.
//   Etapa 1 — formulario 'criar-grupo-mensagem' (mesmo do cadastro de grupo): cria o grupo; o
//             dono entra como membro (backend).
//   Etapa 2 — o mesmo editor de dois cards da UpdatePage, com o grupo recem-criado fixo, para
//             colocar os usuarios nele (Salvar = PUT message-group-members/sync/{id}).
// Se a etapa 1 grava e a 2 falha, o grupo continua criado: o modal avisa e a etapa 2 pode ser
// refeita aqui mesmo ou depois pela tela de edicao.
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import Modal from '@/components/global/Modal';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { fillValues, patchFields } from '@/utils/formSchemaPatch';
import GroupMembersEditor from './GroupMembersEditor';

const SLUG = 'criar-grupo-mensagem';

export interface CreateModalProps {
  open: boolean;
  /** Fecha o modal; `changed` = algum grupo foi criado (a lista deve recarregar). */
  onClose: (changed: boolean) => void;
}

export default function CreateModal({ open, onClose }: CreateModalProps) {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role?.slug === 'admin';

  const [step, setStep] = useState<1 | 2>(1);
  const [createdId, setCreatedId] = useState('');
  const [groupsVersion, setGroupsVersion] = useState(0);
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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

  const schema = useMemo(() => {
    if (!form) return null;
    const me = user ? String(user.id) : '';
    const filled = fillValues(form.schema, { owner_user_manager_id: me, status: 'active' });

    return patchFields(filled, { owner_user_manager_id: isAdmin ? {} : { disabled: true } });
  }, [form, user, isAdmin]);

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
          toast.error('Grupo criado sem id na resposta.', { title: 'Erro ao enviar' });
          return;
        }

        toast.success('Grupo criado. Agora escolha os membros.', { title: form.meta.title });
        setCreatedId(String(id));
        setGroupsVersion((v) => v + 1);
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
      title={step === 1 ? 'Novo grupo — etapa 1 de 2: dados do grupo' : 'Novo grupo — etapa 2 de 2: membros'}
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
          <GroupMembersEditor groupId={createdId} groupsVersion={groupsVersion} />
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
