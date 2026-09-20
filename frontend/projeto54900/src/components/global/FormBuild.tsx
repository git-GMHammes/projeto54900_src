// Componente global reutilizavel: renderiza UM formulario real (por
// table_name + id do form_manager) a partir da definicao gravada no banco.
// Mesmo pipeline de dados do FormRendererPage.tsx (view_form_manager ->
// buildRenderSchema -> FormGrid), mas recebe {table, id} via PROPS -- nao le
// useParams() nem monta PageHeader -- para poder ser invocado de qualquer
// lugar (pagina inteira, modal, card, collapse), nao so da rota
// /v1/form-constructor/:table/:id.
//
// POR QUE {table_name}/id E NAO SLUG (decisao explicita do usuario,
// 2026-09-20): slug e texto digitado por humano no FormBuilderPage --
// sujeito a erro/duplicata (foi exatamente isso que causou o card "dup" no
// calendar-manager, ver README do modulo Calendar). `id` e a PK, nunca
// digitado, nunca ambiguo -- e a chave REAL da busca. `table_name` e
// validado contra o registro encontrado pelo id; se nao bater, mostra erro
// em vez de renderizar o formulario errado.
//
// Nada estatico deve ficar preso a uma rota: quem precisa do Build (pagina,
// modal, card, collapse) so passa table/id como props.

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import MonthCalendar from '@/components/ui/MonthCalendar';
import YearCalendar from '@/components/ui/YearCalendar';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import FakeFillButton from '@/components/global/FakeFillButton';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema, isFormPublished } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';

export interface FormBuildProps {
  table: string;
  id: string | number;
  onLoaded?: (form: RenderForm) => void;
}

export default function FormBuild({ table, id, onLoaded }: FormBuildProps) {
  const toast = useToast();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await formManagerView.getGrouped(
        { fm_id: [String(id)] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
      );
      const { rows } = normalizeList(raw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setError(`Nenhum formulario publicado para o id "${id}".`);
        return;
      }
      // Validacao cruzada: table_name recebido precisa bater com o do
      // registro encontrado pelo id -- evita renderizar o formulario errado
      // se o chamador passar tabela divergente do id.
      if (built.meta.tableName !== table) {
        setForm(null);
        setError(
          `Inconsistente: id ${id} pertence a table_name "${built.meta.tableName ?? '(vazio)'}", nao "${table}".`,
        );
        return;
      }
      setForm(built);
      onLoaded?.(built);
    } catch (err) {
      setForm(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
    } finally {
      setLoading(false);
    }
  }, [id, table, onLoaded]);

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

  return (
    <>
      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {/* Bloco exclusivo da slug "calendario" — mesma excecao do FormRendererPage.tsx. */}
      {form?.meta.slug === 'calendario' && !loading && (
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

      {!loading && !error && form && !isFormPublished(form) && (
        <div className="alert alert-warning py-2">
          Formulario com status <strong>{form.meta.status ?? 'draft'}</strong> — ainda nao publicado.
        </div>
      )}

      {!loading && !error && form && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <FakeFillButton slug={form.meta.slug} />
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
          </div>
        </div>
      )}
    </>
  );
}
