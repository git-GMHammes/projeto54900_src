/**
 * =============================================================================
 * FILE HEADER — CreatePage (user-manager) — criação de usuário
 * =============================================================================
 *
 * O QUE FAZ:
 *   Renderiza o formulário de CRIAÇÃO de usuário. A tela não tem campo escrito
 *   à mão: ela carrega a DEFINIÇÃO do formulário gravada no banco (build de
 *   slug `cadastro-usuario`, em `form_manager` -> `form_groups` -> `form_rows`
 *   -> `form_fields`) e deixa o `<FormGrid>` desenhar a grade. Ao enviar, faz
 *   POST no recurso `user-manager`.
 *
 * MESMO PIPELINE DO FORMULÁRIO GENÉRICO (o que se repete em todo build):
 *   `formManagerView.getGrouped` -> `normalizeList` -> `buildRenderSchema`
 *   -> `<FormGrid>`. É exatamente o caminho do `FormRendererPage.tsx` (rota
 *   `/v1/form/:slug`) e do passo 1 (Login) do `RegisterPage.tsx`; a diferença
 *   aqui é que:
 *     - a slug é FIXA em código (`FORM_SLUG`, BLOCO 1), não vem da URL;
 *     - o submit é TIPADO (`userManagerTable.create`), não o `submit_endpoint`
 *       genérico gravado em `form_manager`.
 *
 * FLUXO (5 etapas):
 *   1. `useEffect` -> `load()` (BLOCO 3) busca a definição agrupada do build;
 *   2. `buildRenderSchema` converte as linhas cruas em `{ meta, schema }`;
 *   3. o JSX (BLOCO 5) monta `<FormGrid schema={schema} />` dentro de um
 *      `<form noValidate>`;
 *   4. no submit, `handleSubmit` (BLOCO 4) valida, converte o `FormData` em
 *      payload e chama `userManagerTable.create`;
 *   5. sucesso -> `toast` + redirect para o detalhe do registro criado;
 *      falha -> `toast.error` (com detalhe de campo, quando houver).
 *
 * DEPENDÊNCIAS:
 *   - `@/services/v1` (`formManagerView`, `userManagerTable`) — leitura do build
 *     e escrita do recurso.
 *   - `@/services/formSchema` (`buildRenderSchema`, `RenderForm`) — traduz as
 *     linhas da view agrupada no `{ meta, schema }` que o `<FormGrid>` entende.
 *   - `@/components/ui/FormGrid/Input` (`FormGrid`, `FormGridSchema`) — a grade
 *     (ver `src/markdown/geral/README_FormGrid.md`); os campos, máscaras e
 *     obrigatoriedade vêm todos da definição do banco.
 *   - `@/utils/formSubmit` (`formDataToPayload`, `errorDetail`) e
 *     `@/utils/apiResult` (`normalizeList`, `normalizeItem`).
 *   - `@/services/http` (`ApiError`), `@/hooks/useToast`, `@/components/global`
 *     (`PageHeader`, `EmptyState`, `LoadingOverlay`) e `@/routes/paths`.
 *
 * CONSUMIDORES: `src/routes/v1/user.routes.tsx` (rota `create`, lazy).
 *   É aberta pelo botão "Novo usuario" do `GetAllPage.tsx`.
 *
 * COMO CRIAR UMA PÁGINA DE CRIAÇÃO SIMILAR (outro recurso):
 *   1. crie o build no banco (form_manager + grupos/linhas/campos) e copie a
 *      slug para `FORM_SLUG`;
 *   2. troque `userManagerTable.create` pelo service de escrita do recurso;
 *   3. ajuste o redirect do sucesso (detalhe com o `id` devolvido, ou lista);
 *   4. mantenha o resto: `getGrouped` -> `buildRenderSchema` -> `<FormGrid>` ->
 *      `formDataToPayload` -> `create` -> `toast` + `navigate`.
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. Campo novo no formulário NÃO se cria aqui: cria-se na definição do banco
 *      (ou no construtor de formulários) — a tela se atualiza sozinha.
 *   2. `status` do usuário não entra no create: quem decide o valor inicial é o
 *      banco/back-end (o registro nasce no estado padrão).
 *   3. O `<form>` tem `noValidate` DE PROPÓSITO: a validação é feita no
 *      `handleSubmit` (BLOCO 4), com `checkValidity`/`reportValidity`.
 *   4. O `key={reloadKey}` do `<form>` é o mecanismo de "limpar": trocar a key
 *      remonta o formulário e descarta o que foi digitado.
 * =============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView, userManagerTable } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

/**
 * =============================================================================
 * BLOCO 1 — CONSTANTE DE MÓDULO (a slug do build)
 * =============================================================================
 *
 * O QUE FAZ: fixa o `fm_slug` do build que esta tela carrega (BLOCO 3). É a
 *   ÚNICA informação do formulário que mora em código: grupos, linhas, campos,
 *   tipos, máscaras, rótulos e obrigatoriedade vêm todos do banco.
 *
 * POR QUE É CONSTANTE: esta página é de um recurso ESPECÍFICO (criar usuário),
 *   não um formulário genérico por URL (`/v1/form/:slug`). Trocar a string aqui
 *   troca o formulário inteiro da tela — é o ponto de configuração rápido.
 *
 * DE ONDE VEM A DEFINIÇÃO: `form_manager` (slug `cadastro-usuario`) ->
 *   `form_groups` -> `form_rows` -> `form_fields`, lidos pela view agrupada.
 *   A MESMA slug é usada pelo passo 1 (Login) do `RegisterPage.tsx`, que monta
 *   o cadastro em etapas.
 * -------------------------------------------------------------------------
 */
const FORM_SLUG = 'cadastro-usuario';

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  /**
   * =============================================================================
   * BLOCO 2 — ESTADO DO COMPONENTE (definição x envio)
   * =============================================================================
   *
   * O QUE FAZ: guarda o resultado do carregamento, o estado do POST e os dois
   *   hooks de apoio (`useNavigate` para o redirect do sucesso, `useToast` para
   *   o feedback — ambos usados no BLOCO 4).
   *
   * CAMPO A CAMPO, POR JANELA DE TELA:
   *   form       -> `RenderForm` completo (`meta` + `schema`); é daqui que sai o
   *                 título do toast (`form.meta.title`) e o `schema` inicial;
   *   schema     -> cópia de `form.schema`, mantida à parte porque é ELA que o
   *                 JSX testa para decidir se renderiza o formulário;
   *   error      -> mensagem de falha de CARGA (BLOCO 3) exibida no `<EmptyState>`;
   *   loading    -> true enquanto a definição é buscada;
   *   submitting -> true durante o POST; desabilita o botão "Criar" e evita
   *                 envio duplicado;
   *   reloadKey  -> contador usado como `key` do `<form>`: incrementar remonta o
   *                 formulário do zero (é o que o botão "Limpar" faz).
   *
   * POR QUE `form` E `schema` SEPARADOS: `form` carrega os metadados que o toast
   *   usa; `schema` é o que vai para a grade. Quando existe transformação do
   *   schema (como em `UpdatePage.tsx`, que injeta `defaultValue`), ela acontece
   *   entre os dois — por isso eles não são o mesmo estado.
   * -------------------------------------------------------------------------
   */
  const [form, setForm] = useState<RenderForm | null>(null);
  const [schema, setSchema] = useState<FormGridSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  /**
   * =============================================================================
   * BLOCO 3 — CARREGAMENTO DA DEFINIÇÃO (1 requisição, na montagem)
   * =============================================================================
   *
   * O QUE FAZ, na ordem:
   *   1. `formManagerView.getGrouped({ fm_slug: [FORM_SLUG] }, { limit: 1000,
   *      sort: 'fc_sort_order', order: 'ASC' })` — a view AGRUPADA do build, já
   *      ordenada pela ordem visual dos campos e com limite alto para não
   *      truncar grupo/linha/campo;
   *   2. `normalizeList(raw)` -> `{ rows }` (o envelope da API sempre é
   *      normalizado antes de ser usado);
   *   3. `buildRenderSchema(rows)` -> `{ meta, schema }` ou `null`;
   *   4. `null` = build inexistente/incompleto (NÃO é falha de rede): vira
   *      `error` com a mensagem que aparece no `<EmptyState>` do BLOCO 5;
   *   5. exceção (rede/API) -> `ApiError.message`; erro não tipado -> mensagem
   *      genérica.
   *
   * O `useEffect` logo abaixo só chama `load()` na montagem: quem faz a
   *   requisição é o `load` (memoizado com `useCallback([])`), para que a mesma
   *   função possa ser reexecutada depois sem duplicar código.
   * -------------------------------------------------------------------------
   */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await formManagerView.getGrouped(
        { fm_slug: [FORM_SLUG] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
      );
      const { rows } = normalizeList(raw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setSchema(null);
        setError(`Nenhum formulario publicado para a slug "${FORM_SLUG}".`);
        return;
      }
      setForm(built);
      setSchema(built.schema);
    } catch (err) {
      setForm(null);
      setSchema(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * =============================================================================
   * BLOCO 4 — HANDLER DE SUBMIT (validar -> converter -> criar -> redirecionar)
   * =============================================================================
   *
   * O QUE FAZ, no clique em "Criar":
   *   1. `preventDefault` + validação NATIVA do `<form>` (`checkValidity` e, se
   *      inválido, `reportValidity`) — o formulário é `noValidate`, então quem
   *      valida é este código, com as mensagens do próprio navegador;
   *   2. `formDataToPayload(el)` (`@/utils/formSubmit`) converte o `FormData` num
   *      objeto plano de payload — o MESMO helper do renderer genérico, o que
   *      garante o mesmo formato de corpo em qualquer build;
   *   3. `userManagerTable.create(payload)` -> POST no recurso user-manager;
   *   4. `normalizeItem(res)` extrai o registro criado (e o `id`);
   *   5. `toast.success` e redirect: para o DETALHE do registro criado quando a
   *      API devolve `id` (string ou número); sem `id`, cai na lista;
   *   6. erro -> `ApiError` vira `toast.error` com o detalhe de campos de
   *      validação (`errorDetail`) quando houver; erro não tipado vira mensagem
   *      genérica. O `finally` sempre devolve `submitting` para `false`.
   *
   * POR QUE O REDIRECT: permanecer na tela deixaria o formulário preenchido com
   *   um registro que já existe (risco de cadastro duplicado). Ir para o detalhe
   *   confirma o resultado e mostra exatamente o que foi gravado.
   *
   * A DEPENDÊNCIA `[form, navigate, toast]` do `useCallback` existe para o toast
   *   poder usar `form.meta.title` — o título do build é o título do feedback.
   * -------------------------------------------------------------------------
   */
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }

      const payload = formDataToPayload(el);
      setSubmitting(true);
      try {
        const res = await userManagerTable.create(payload);
        const row = normalizeItem<ApiRow>(res);
        const id = row?.id;
        toast.success('Usuario criado.', { title: form?.meta.title ?? 'Novo usuario' });
        if (typeof id === 'string' || typeof id === 'number') {
          navigate(paths.v1.user.view(id));
        } else {
          navigate(paths.v1.user.list);
        }
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
    [form, navigate, toast],
  );

  /**
   * =============================================================================
   * BLOCO 5 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ, em 3 janelas:
   *   1. `<PageHeader>` — título "Novo usuario", subtítulo com o endpoint de
   *      criação e botão "Voltar" para a lista;
   *   2. estados de tela: `loading` -> `<LoadingOverlay />`; `error` ->
   *      `<EmptyState>` com a mensagem do BLOCO 3 (sem definição não há grid);
   *   3. cartão com o `<form>`: `<FormGrid schema={schema} />` desenha a grade do
   *      build e a barra de ações fecha com "Criar" (submit, desabilitado
   *      durante `submitting`) e "Limpar" (`type="reset"` + `reloadKey`, que
   *      remonta o formulário e descarta o digitado).
   *
   * NÃO EXISTE estado por campo nesta página: o valor de cada campo mora dentro
   *   do componente de campo do `<FormGrid>`. Esta tela só lê os valores UMA vez,
   *   no submit, via `new FormData(el)` — dentro do `formDataToPayload` (BLOCO 4).
   * -------------------------------------------------------------------------
   */
  return (
    <>
      <PageHeader title="Novo usuario" subtitle="POST api/v1/user-manager/create">
        <Link className="btn btn-outline-secondary" to={paths.v1.user.list}>
          Voltar
        </Link>
      </PageHeader>

      {/* 2a. Carga da definição do build: overlay cheio (sem schema não há grid). */}
      {loading && <LoadingOverlay />}

      {/* 2b. Definição ausente/quebrada: EmptyState com a mensagem do BLOCO 3. */}
      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {/* 3. Formulário do build (FormGrid) + barra de ações Criar/Limpar. */}
      {!loading && !error && schema && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <form key={reloadKey} onSubmit={(e) => void handleSubmit(e)} noValidate>
              <FormGrid schema={schema} />
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Criando...' : 'Criar'}
                </button>
                <button type="reset" className="btn btn-outline-secondary" onClick={() => setReloadKey((k) => k + 1)}>
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
