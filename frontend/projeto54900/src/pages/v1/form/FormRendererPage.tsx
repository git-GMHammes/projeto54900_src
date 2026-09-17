/**
 * =============================================================================
 * FILE HEADER — FormRendererPage (renderiza UM formulário publicado pela slug)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Página `/v1/form/:slug`: carrega a DEFINIÇÃO do formulário cuja slug veio na
 *   URL, monta a tela com `<FormGrid>` e envia o preenchimento para o
 *   `submit_endpoint` GRAVADO no registro (com o método também gravado). É a
 *   ponta final do módulo Form: aqui o formulário é usado, não construído.
 *
 * PIPELINE (3 etapas):
 *   1. CARREGAR — `formManagerView.getGrouped({ fm_slug: [slug] })` (POST em
 *      `/{version}/form-manager-view/get-grouped`) devolve 1 linha por campo;
 *      `normalizeList` extrai `rows` e `buildRenderSchema(rows)`
 *      (`@/services/formSchema`) devolve `RenderForm` = `{ meta, schema }`.
 *   2. MONTAR — `meta` (título/descrição/status/endpoint/método) vai para o
 *      cabeçalho e para o aviso de status; `schema` é UM `FormGridSchema` só,
 *      com as linhas de TODOS os grupos achatadas (os títulos de seção são
 *      preservados na 1ª linha de cada grupo).
 *   3. ENVIAR — o submit do `<form>` interno monta o payload com
 *      `formDataToPayload`, escolhe o verbo com `senderFor(meta.httpMethod)` e
 *      resolve a URL com `resolveEndpoint(meta.submitEndpoint)`.
 *
 * CONTRATO DO REGISTRO (o que quem publicou precisa ter gravado):
 *   `slug`            é a chave da URL (`/v1/form/calendario`) — sem definição
 *                     para a slug, a página mostra "Nenhum formulario publicado".
 *   `submit_endpoint` destino do envio; vazio -> toast de "Sem destino" e o
 *                     formulário NÃO é enviado.
 *   `http_method`     verbo do envio (ver `senderFor`: PUT/PATCH tratados;
 *                     qualquer outro cai em POST).
 *   `status`          `active` = publicado; diferente disso a tela avisa, mas NÃO
 *                     bloqueia o envio.
 *   grupos/linhas/campos são a estrutura do formulário em si.
 *
 * DEPENDÊNCIAS (arquivos deste projeto que esta página consome):
 *   - `@/services/formSchema` (`buildRenderSchema`, `RenderForm`) — o adapter
 *     view -> `{ meta, schema }`; é lá que `fc_*` vira prop de campo e que os
 *     grupos viram um único formulário.
 *   - `@/utils/formSubmit` — `formDataToPayload` (FormData -> corpo),
 *     `senderFor` (verbo -> função do `http`), `resolveEndpoint` (tira o prefixo
 *     `env.apiBaseUrl`, que o wrapper `http` já põe) e `errorDetail` (achata o
 *     bag `errors` da API numa linha).
 *   - `@/components/ui/FormGrid/Input` (`<FormGrid>`) — todo campo vem do schema;
 *     nenhum `<input>` é escrito à mão.
 *   - `@/components/global/Modal` — o modal GLOBAL (controlado por `open`), e
 *     NÃO o `FormModal` dos construtores: aqui não há rodapé de salvar, o botão
 *     "Enviar" está dentro do próprio formulário.
 *   - `@/components/ui/MonthCalendar` e `YearCalendar` — só no bloco especial da
 *     slug `calendario` (ver abaixo).
 *   - `@/services/v1` (`formManagerView` — read-only), `@/services/http`
 *     (`ApiError`), `@/hooks/useToast`, `@/utils/apiResult` (`normalizeList`),
 *     `@/routes/paths` (`paths.v1.form.list`, o botão "Voltar") e
 *     `@/components/global` (`PageHeader`, `EmptyState`, `LoadingOverlay`).
 *
 * CONSUMIDORES:
 *   - `src/routes/v1/form.routes.tsx` -> `/v1/form/:slug` (lazy). É o ÚNICO
 *     consumidor; qualquer formulário publicado fica acessível por esta rota.
 *
 * CASO ESPECIAL — slug `calendario`:
 *   quando a slug é `calendario`, a página desenha TAMBÉM o mês corrente
 *   (`<MonthCalendar>`) e o ano (`<YearCalendar>`) acima do botão do formulário.
 *   É um bloco exclusivo, hardcoded, e o resto da página continua genérico.
 *
 * COMO PUBLICAR/CRIAR UM FORMULÁRIO PARA ESTA PÁGINA:
 *   1. Monte o formulário em `/v1/form-constructor` (FormBuilderPage): tabela,
 *      grupos, linhas e campos.
 *   2. Preencha `slug`, `title`/`description`, `submit_endpoint` e `http_method`
 *      no modal do nível `form_manager` — é o que esta página lê do registro.
 *   3. Acesse `/v1/form/<slug>`. Sem `submit_endpoint`, o envio é recusado com
 *      aviso; com o endpoint certo, o registro vai para a API do módulo dono.
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. A página não conhece nenhum módulo de negócio: o destino é dado, não
 *      codificado. Não crie `if (slug === 'x')` para regra de NEGÓCIO — o caso
 *      `calendario` existe só por causa da visualização de calendário.
 *   2. `load` depende de `slug`: navegar de um formulário para outro
 *      (mesma rota, param diferente) recarrega a definição sozinho.
 *   3. `meta.status !== 'active'` é AVISO, não bloqueio — o envio continua
 *      permitido (decisão de produto).
 *   4. O `<FormGrid>` é remontado após o envio (`reloadKey`): mexer nisso muda o
 *      comportamento dos selects remotos do formulário.
 * =============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import MonthCalendar from '@/components/ui/MonthCalendar';
import YearCalendar from '@/components/ui/YearCalendar';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

/**
 * =============================================================================
 * BLOCO 1 — ESTADO DA PÁGINA (definição x UI)
 * =============================================================================
 *
 * DE ONDE VEM A SLUG: do PARÂMETRO DE ROTA (`useParams`), não de um seletor na
 *   tela. Trocar a URL troca o formulário — e `load` (BLOCO 2) reage a isso.
 *
 * DADOS (a definição carregada):
 *   `form`    `RenderForm` = `{ meta, schema }` (BLOCO 2); `null` = ainda não
 *             carregado OU slug sem formulário publicado
 *   `loading` overlay cheio durante a carga
 *   `error`   mensagem de falha de API ou de "slug sem definição"
 *
 * UI (controle de interação):
 *   `showFormModal` controla o modal GLOBAL do formulário. O formulário NÃO
 *                   fica inline na página: ele é o conteúdo do modal.
 *   `submitting`    desabilita o botão "Enviar" e troca o rótulo para
 *                   "Enviando..." enquanto a requisição está no ar
 *   `reloadKey`     contador que entra no `key` do `<FormGrid>` (BLOCO 4):
 *                   incrementar = REMONTAR o formulário depois do envio, para
 *                   os `select` REMOTOS refazerem o fetch (o `FormGrid` busca as
 *                   opções na montagem). Não guarda dado nenhum.
 *
 * COMO REAPROVEITAR: é o mesmo desenho de estado das outras telas de formulário
 *   dinâmico — dados de um lado, controle de modal/envio do outro.
 * -------------------------------------------------------------------------
 */
export default function FormRendererPage() {
  // A slug do formulário vem da URL: é a chave de todo o carregamento.
  const { slug = '' } = useParams();
  const toast = useToast();
  // Dados: definição convertida + carga/erro.
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // UI: abertura do modal, envio em andamento e a "versão" do FormGrid.
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  /**
   * =============================================================================
   * BLOCO 2 — CARREGAMENTO DA DEFINIÇÃO (`load`)
   * =============================================================================
   *
   * O QUE FAZ: busca as linhas da view para ESTA slug e converte em UM
   *   formulário.
   *   1. `formManagerView.getGrouped({ fm_slug: [slug] }, { limit, sort, order })`
   *      — `fm_slug` vai no corpo (filtro) e a ordenação na query;
   *      `limit: 1000` porque a view devolve 1 linha por CAMPO (cortar a
   *      paginação perderia campos sem avisar).
   *   2. `normalizeList(raw)` -> `rows`.
   *   3. `buildRenderSchema(rows)` -> `{ meta, schema }` ou `null` quando não há
   *      nenhum grupo (nenhum campo publicado para a slug).
   *      O `schema` é UM só: o adapter achata as linhas de todos os grupos e
   *      mantém o título de seção na primeira linha de cada grupo.
   *
   * ERRO — dois casos no mesmo `error`:
   *   - `buildRenderSchema` devolveu `null` -> "Nenhum formulario publicado para a
   *     slug ..." (definição não existe/incompleta — NÃO é falha de rede);
   *   - exceção (rede/API) -> `ApiError.message`.
   *   Nos dois `form` volta a `null`, o que fecha o modal (`open={showFormModal &&
   *   !!form}`) e esconde o botão de abrir (BLOCO 4).
   *
   * POR QUE DEPENDE DE `slug`: a rota é a MESMA para todos os formulários
   *   (`/v1/form/:slug`); trocar a slug na URL recria o `useCallback` e o efeito
   *   roda de novo — é assim que a página "navega" entre formulários.
   * -------------------------------------------------------------------------
   */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // `fm_slug` no corpo (filtro da view); `limit` folgado: 1 linha por campo.
      const raw = await formManagerView.getGrouped(
        { fm_slug: [slug] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
      );
      const { rows } = normalizeList(raw);
      const built = buildRenderSchema(rows);
      // `null` = slug sem NENHUM grupo: não é erro de rede, é definição ausente.
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

  // Efeito único por slug: a definição é lida na montagem e a cada troca de slug.
  useEffect(() => {
    void load();
  }, [load]);

  /**
   * =============================================================================
   * BLOCO 3 — HANDLER DE SUBMIT (envia para o destino GRAVADO no registro)
   * =============================================================================
   *
   * O QUE FAZ: monta o corpo a partir do `<form>` do modal e envia para o
   *   endpoint/método que vieram da definição — nada de URL nem verbo fixos no
   *   código.
   *
   * PASSO A PASSO:
   *   1. `preventDefault()` — envio é via fetch, a página não navega.
   *   2. GUARDA DE DESTINO: sem `meta.submitEndpoint`, avisa ("Sem destino") e
   *      sai sem enviar. É o único caminho em que um formulário publicado não
   *      consegue gravar.
   *   3. `formDataToPayload(el)` — FormData -> corpo (a versão COMPARTILHADA de
   *      `@/utils/formSubmit`: `campo[]` vira ARRAY, vazios são omitidos).
   *   4. `senderFor(meta.httpMethod)` — escolhe a função do `http` pelo verbo
   *      (PUT/PATCH; qualquer outro cai em POST). `resolveEndpoint(...)` tira o
   *      prefixo `env.apiBaseUrl` que o wrapper `http` já adiciona.
   *   5. Envio, com `submitting` ligado até o `finally` (o botão volta a
   *      responder sozinho).
   *
   * SUCESSO: toast com o título do formulário + `el.reset()` (limpa o formulário
   *   do modal) + `reloadKey + 1` (BLOCO 1) — a remontagem do `<FormGrid>` é o
   *   que faz os `select` remotos trazerem as opções atualizadas.
   *
   * ERRO: `ApiError` rende `mensagem + errorDetail(err)`, e o `errorDetail`
   *   achata numa linha as mensagens por campo do bag `errors` da API — sem isso
   *   o usuário só veria a mensagem genérica do envelope. Erro não-API (rede)
   *   cai na mensagem fixa.
   *
   * `useCallback` com `[form, toast]`: o handler só é recriado quando a definição
   *   (ou o toast) muda — trocar a slug já recria tudo pelo BLOCO 2.
   * -------------------------------------------------------------------------
   */
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // Sem destino gravado não há o que enviar — e isso é avisado, não ignorado.
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
        // Limpa o formulário e REMONTA o FormGrid (selects remotos re-buscam).
        el.reset();
        setReloadKey((k) => k + 1);
      } catch (err) {
        if (err instanceof ApiError) {
          // `errorDetail` devolve ' — msg1 | msg2' a partir do bag `errors`.
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

  /**
   * =============================================================================
   * BLOCO 4 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ: 5 janelas, na ordem:
   *   1. `<PageHeader>` — título/subtítulo do `meta` (com fallbacks) + "Voltar"
   *      (para a lista do módulo) e "Recarregar" (refaz o BLOCO 2).
   *   2. `loading` -> `<LoadingOverlay />` cheio (carga da definição).
   *   3. `error` -> `<EmptyState>` — inclui o caso "slug sem formulário".
   *   4. Bloco especial da slug `calendario` (mês + ano) — só visualização, não
   *      depende do formulário carregado.
   *   5. Botão que abre o modal + o próprio `<Modal>` com o formulário.
   *
   * DETALHES QUE PARECEM DETALHE (e são o coração da tela):
   *   - O FORMULÁRIO SÓ EXISTE DENTRO DO MODAL: o botão "Novo Calendário" só
   *     aparece com definição carregada e sem erro (`!loading && !error && form`),
   *     e o modal abre com `open={showFormModal && !!form}` — se a definição sair
   *     da tela, o modal fecha sozinho.
   *   - `<FormGrid key={reloadKey} ...>`: a `key` carrega o contador do BLOCO 1 e é
   *     o que remonta o formulário após um envio bem-sucedido.
   *   - Aviso de status: `meta.status` diferente de `active` renderiza o `alert`
   *     de "ainda nao publicado" — é AVISO, o "Enviar" continua habilitado.
   *   - `Modal` é o GLOBAL (`components/global/Modal`), com `size="lg"`; não tem
   *     rodapé, então os botões "Enviar" (submit) e "Limpar" (reset nativo)
   *     vivem dentro do formulário.
   *
   * COMO REAPROVEITAR: para uma slug com UI própria, siga o padrão do bloco do
   *   calendário (condicional por slug, sem tocar no formulário); para qualquer
   *   formulário novo, NADA muda aqui — basta publicá-lo (BLOCO 2/header).
   * -------------------------------------------------------------------------
   */
  return (
    <>
      {/* Janela 1 — cabeçalho: título/descrição vêm do meta, com fallback. */}
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

      {/* Janela 2 — carregando a definição da slug. */}
      {loading && <LoadingOverlay />}

      {/* Janela 3 — erro de API ou slug sem formulário publicado. */}
      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {/* Janela 4 — bloco exclusivo da slug "calendario" — FormRendererPage continua generica para as demais. */}
      {slug === 'calendario' && !loading && (
        <>
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <MonthCalendar year={new Date().getFullYear()} month={new Date().getMonth()} size="lg" />
            </div>
          </div>

          <div className="mb-4">
            <h2 className="h5 mb-3">Ano completo</h2>
            <YearCalendar year={new Date().getFullYear()} />
          </div>
        </>
      )}

      {/* Janela 5a — abre o modal; sem definição carregada o botão não existe. */}
      {!loading && !error && form && (
        <button type="button" className="btn btn-primary mb-4" onClick={() => setShowFormModal(true)}>
          Novo Calendário
        </button>
      )}

      {/* Janela 5b — o modal global com o formulário; `&& !!form` fecha se a definição sumir. */}
      <Modal
        open={showFormModal && !!form}
        title={form?.meta.title}
        onClose={() => setShowFormModal(false)}
        size="lg"
      >
        {form && (
          <>
            {/* Aviso de status: rascunho/inativo publica menos, mas não bloqueia o envio. */}
            {form.meta.status && form.meta.status !== 'active' && (
              <div className="alert alert-warning py-2">
                Formulario com status <strong>{form.meta.status}</strong> — ainda nao publicado.
              </div>
            )}

            {/* A `key` com o reloadKey remonta o FormGrid após envio (selects remotos). */}
            <form onSubmit={(e) => void handleSubmit(e)} noValidate>
              <FormGrid key={reloadKey} schema={form.schema} />
              {/* Botões dentro do form: "Enviar" é o submit; "Limpar" é o reset nativo. */}
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar'}
                </button>
                <button type="reset" className="btn btn-outline-secondary">
                  Limpar
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </>
  );
}
