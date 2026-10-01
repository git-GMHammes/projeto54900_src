// Formulario de criacao de sala de chat — build 'criar-sala-chat' (form_manager,
// tabela chat_rooms_manager). Mesmo pipeline de pages/v1/user/user-manager/CreatePage.tsx:
// formManagerView.getGrouped -> buildRenderSchema -> FormGrid -> submit para o
// submit_endpoint do build. Ver src/markdown/geral/README_FormGrid.md.
//
// O aceite de moderacao (moderation_accepted) e obrigatorio no CreateRequest
// do backend (in_list[1]). A funcao de moderador tem responsabilidade civil/
// criminal real (Clausula 4 do Termo, public/legal/termo-moderador.txt —
// fonte: doc/txt/termo.txt): por isso as clausulas sao exibidas em prosa
// (nao um dump de .txt com banners ASCII) dentro de UM CARD, e o checkbox de
// aceite (rotulo exato da Clausula 9.1) fica no rodape do MESMO card — nao
// solto abaixo, junto dos campos "Nome"/"Descricao". O botao "Criar" fica
// DESABILITADO (nao so bloqueado no submit) ate o aceite; o `required` do
// campo continua como defesa extra.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema, FormRowSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';
import { env } from '@/config/env';

const SLUG = 'criar-sala-chat';
const MODERATION_FIELD_NAME = 'moderation_accepted';
const TERMS_URL = `${env.basePath}/legal/termo-moderador.txt`;

// Injeta o onChange no campo de aceite para o pai acompanhar o estado
// marcado/desmarcado — o resto do schema (vindo do banco) fica intacto. O
// CheckboxField chama onChange mesmo nao-controlado (sem `value`), entao o
// campo continua gerenciando o proprio estado visual sozinho.
function withAcceptanceTracking(schema: FormGridSchema, onAccept: (accepted: boolean) => void): FormGridSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((f) =>
        f.type === 'checkbox' && f.name === MODERATION_FIELD_NAME
          ? { ...f, onChange: (values: string[]) => onAccept(values.length > 0) }
          : f,
      ),
    })),
  };
}

interface TermsBlock {
  kind: 'heading' | 'paragraph';
  text: string;
}

// Prosa das clausulas 1 a 10 (sem o cabecalho ASCII "====" nem a secao
// "DECLARACAO DE ACEITE" — essa vira o checkbox real, nao texto). Cada
// paragrafo do .txt ja e uma linha propria separada por linha em branco;
// "CLAUSULA N - ..." vira subtitulo.
function parseTermsBody(raw: string): TermsBlock[] {
  const from = raw.indexOf('Pelo presente instrumento');
  const to = raw.indexOf('DECLARAÇÃO DE ACEITE');
  const body = raw.slice(from >= 0 ? from : 0, to >= 0 ? to : raw.length);

  return body
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((text) => ({ kind: /^CLÁUSULA\s+\d+/.test(text) ? 'heading' : 'paragraph', text }));
}

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [termsBlocks, setTermsBlocks] = useState<TermsBlock[]>([]);
  const [termsLoading, setTermsLoading] = useState(true);
  const [termsError, setTermsError] = useState<string | null>(null);

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
      setForm({ meta: built.meta, schema: withAcceptanceTracking(built.schema, setAccepted) });
    } catch (err) {
      setForm(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTerms = useCallback(async () => {
    setTermsLoading(true);
    setTermsError(null);
    try {
      const resp = await fetch(TERMS_URL);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setTermsBlocks(parseTermsBody(await resp.text()));
    } catch {
      setTermsError('Falha ao carregar o Termo de Responsabilidade e Confidencialidade.');
    } finally {
      setTermsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadTerms();
  }, [load, loadTerms]);

  // O checkbox de aceite fica isolado (rodape do card do termo); os demais
  // campos (nome, descricao) seguem no bloco "Dados da Sala" logo abaixo.
  const { moderationRow, roomRows } = useMemo(() => {
    if (!form) return { moderationRow: null as FormRowSchema | null, roomRows: [] as FormRowSchema[] };
    const modRow = form.schema.rows.find((row) =>
      row.fields.some((f) => f.type === 'checkbox' && f.name === MODERATION_FIELD_NAME),
    );
    return {
      moderationRow: modRow ?? null,
      roomRows: form.schema.rows.filter((row) => row !== modRow),
    };
  }, [form]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity() || !accepted) {
        el.reportValidity();
        return;
      }
      if (!form?.meta.submitEndpoint) {
        toast.error('Formulario sem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const payload = formDataToPayload(el);
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
        toast.success('Sala de chat criada.', { title: form.meta.title });
        void navigate(paths.v1.chatRooms.list);
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
    [form, accepted, navigate, toast],
  );

  return (
    <>
      <PageHeader
        title={form?.meta.title ?? 'Nova sala de chat'}
        subtitle={form?.meta.description ?? 'POST api/v1/chat-rooms-manager/create'}
      />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {!loading && !error && form && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-body-tertiary">
              <h2 className="h6 fw-semibold mb-0">Termo de Responsabilidade e Confidencialidade — Moderador</h2>
              <p className="text-body-secondary small mb-0">Leia integralmente antes de aceitar.</p>
            </div>

            {termsLoading && <LoadingOverlay />}
            {termsError && !termsLoading && (
              <div className="card-body">
                <EmptyState title="Termo indisponivel" description={termsError} variant="danger" />
              </div>
            )}

            {!termsLoading && !termsError && (
              <>
                <div className="card-body" style={{ maxHeight: '22rem', overflowY: 'auto' }}>
                  {termsBlocks.map((block, i) =>
                    block.kind === 'heading' ? (
                      <h3 key={i} className="h6 fw-bold mt-3 mb-2">
                        {block.text}
                      </h3>
                    ) : (
                      <p key={i} className={`small mb-2 ${/^[a-z]\)/.test(block.text) ? 'ps-3' : ''}`}>
                        {block.text}
                      </p>
                    ),
                  )}
                </div>

                {moderationRow && (
                  <div className="card-footer bg-body-tertiary">
                    <FormGrid schema={{ rows: [moderationRow] }} />
                    <p className="text-body-secondary small mb-0 mt-1">
                      Ao marcar e clicar em &ldquo;Criar&rdquo;, você concorda com todas as cláusulas deste Termo (Cláusula 9).
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {roomRows.length > 0 && (
            <>
              <h2 className="h6 fw-semibold text-primary text-uppercase mb-2">Dados da Sala</h2>
              <FormGrid schema={{ rows: roomRows }} />
            </>
          )}

          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting || !accepted}>
              {submitting ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
