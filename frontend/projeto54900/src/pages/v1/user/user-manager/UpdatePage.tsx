/**
 * =============================================================================
 * FILE HEADER — UpdatePage (user-manager) — edição de usuário
 * =============================================================================
 *
 * O QUE FAZ:
 *   Renderiza o formulário de EDIÇÃO de usuário. Como o `CreatePage.tsx`, a tela
 *   não tem campo escrito à mão: carrega a DEFINIÇÃO do build gravada no banco
 *   (slug `atualizar-usuario`), converte em `{ meta, schema }` e deixa o
 *   `<FormGrid>` desenhar a grade. A diferença é UM passo a mais: cada campo é
 *   pré-preenchido com o valor atual do registro antes de montar a grade.
 *
 * O QUE DIFERE DO `CreatePage.tsx` (mesmo pipeline, duas diferenças reais):
 *   1. CARGA: além da definição, busca também o registro
 *      (`userManagerTable.get(id)`) e injeta os valores via `applyValues`
 *      (BLOCO 2) sobre o schema — é o que faz a tela abrir preenchida;
 *   2. ESCRITA: usa `userManagerTable.update(id, payload)`, ou seja, PUT em
 *      `api/v1/user-manager/update/{id}`. O `id` vem da ROTA (não do payload),
 *      e o resource já resolve essa URL; por isso o `submit_endpoint` estático
 *      de `form_manager` NÃO é usado aqui.
 *
 * SENHA NÃO PASSA AQUI (decisão de back-end, não de front):
 *   `password_hash` não faz parte deste build porque o `UpdateRequest.php` do
 *   back-end não aceita alteração de senha por esta rota — troca de senha é um
 *   fluxo dedicado. Se um campo de senha aparecer na grade, o back-end o ignora.
 *
 * FLUXO (5 etapas):
 *   1. `useEffect` -> `load()` (BLOCO 4) dispara as DUAS requisições em paralelo
 *      (`Promise.all`): definição agrupada do build + registro atual;
 *   2. `buildRenderSchema(rows)` -> `{ meta, schema }`; `applyValues(schema,
 *      record)` devolve um schema NOVO, com `defaultValue` por nome de campo;
 *   3. o JSX (BLOCO 6) monta `<FormGrid schema={schema} />` dentro de um
 *      `<form noValidate>`;
 *   4. no submit, `handleSubmit` (BLOCO 5) valida, converte o `FormData` em
 *      payload e chama `userManagerTable.update(id, payload)`;
 *   5. sucesso -> `toast` + redirect para o detalhe; falha -> `toast.error`.
 *
 * DEPENDÊNCIAS:
 *   - `@/services/v1` (`formManagerView`, `userManagerTable`).
 *   - `@/services/formSchema` (`buildRenderSchema`, `RenderForm`).
 *   - `@/components/ui/FormGrid/Input` (`FormGrid`, `FormGridSchema`).
 *   - `@/utils/formSubmit` (`formDataToPayload`, `errorDetail`), `@/utils/apiResult`
 *     (`normalizeList`, `normalizeItem`) e `@/types/api` (`ApiRow`).
 *   - `@/services/http` (`ApiError`), `@/hooks/useToast`, `@/components/global`
 *     (`PageHeader`, `EmptyState`, `LoadingOverlay`) e `@/routes/paths`.
 *
 * CONSUMIDORES: `src/routes/v1/user.routes.tsx` (rota `update`, lazy).
 *   É aberta pelo botão "Editar" do `GetPage.tsx`.
 *
 * COMO CRIAR UMA PÁGINA DE EDIÇÃO SIMILAR (outro recurso):
 *   1. copie o `CreatePage.tsx` do recurso (é o irmão mais simples);
 *   2. troque a slug do build (`FORM_SLUG`) e o service de escrita;
 *   3. adicione o `get(id)` no `Promise.all` do `load` e o `applyValues` sobre o
 *      schema;
 *   4. ajuste o redirect do sucesso (aqui, o detalhe do próprio registro).
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. `id` vem de `useParams()` com default `''`: é o `id` da rota que manda no
 *      GET e no PUT — nunca um id do payload.
 *   2. `applyValues` NÃO MUTA o schema recebido: devolve um objeto novo com
 *      `rows`/`fields` remapeados. Manter essa pureza é o que permite guardar o
 *      schema original e reaproveitar.
 *   3. O botão "Desfazer alteracoes" não desfaz campo a campo: ele incrementa o
 *      `reloadKey`, que é a `key` do `<form>` — a remontagem recarrega os
 *      `defaultValue` originais.
 *   4. Campo novo no formulário não se cria aqui: cria-se na definição do banco.
 * =============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

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
 * O QUE FAZ: fixa o `fm_slug` do build que esta tela carrega (BLOCO 4).
 *
 * POR QUE É CONSTANTE: a página é de um recurso ESPECÍFICO (editar usuário), e
 *   não um formulário genérico por URL. Trocar a string troca o formulário
 *   inteiro — grupos, linhas, campos, tipos e rótulos vêm todos do banco.
 *
 * ATENÇÃO: existe OUTRO build em uso nos cadastros de usuário — a slug
 *   `cadastro-usuario`, do `CreatePage.tsx` e do passo 1 (Login) do
 *   `RegisterPage.tsx`. As duas slugs são independentes: mudar uma NÃO afeta a
 *   outra, de propósito (criar e editar podem ter campos diferentes).
 * -------------------------------------------------------------------------
 */
const FORM_SLUG = 'atualizar-usuario';

/**
 * =============================================================================
 * BLOCO 2 — HELPERS PUROS (fora do componente)
 * =============================================================================
 *
 * São as duas funções sem estado que sustentam o pré-preenchimento. Ficam fora
 *   do componente de propósito: são puras (entrada -> saída) e, por isso,
 *   testáveis e reaproveitáveis em qualquer outro recurso.
 *
 * `toStr` — conversão tolerante a `unknown`:
 *   o registro vem de `normalizeItem` (tipos largos), então o valor pode ser
 *   `string`, `number`, `boolean`, `null` ou objeto. `String(v)` normaliza tudo
 *   para texto, EXCETO `null`/`undefined`, que devolvem `undefined` — e
 *   `undefined` significa "não mexer no campo", o que evita limpar um campo que
 *   já tinha `defaultValue` próprio.
 *
 * `applyValues` — injeta os valores atuais no schema:
 *   1. percorre `schema.rows` -> `row.fields` (a mesma estrutura que o
 *      `<FormGrid>` consome) e devolve um schema NOVO (`map` + spread: nada é
 *      mutado);
 *   2. para cada campo, busca `values[f.name]` — a correspondência é POR NOME
 *      do campo, que é a chave do payload no banco (`field_name`);
 *   3. campo sem correspondência no registro fica INTACTO (o `defaultValue`
 *      original do build é preservado);
 *   4. `checkbox` é PULADO: nesse tipo, `defaultValue` é `string[]`, e o valor
 *      do registro não tem essa forma — o build `atualizar-usuario` não usa o
 *      tipo, e pular mantém a função segura se ele passar a usar.
 *
 * COMO REAPROVEITAR: é o mesmo mecanismo para qualquer tela "editar registro"
 *   com formulário dinâmico — só a origem de `values` muda (aqui,
 *   `userManagerTable.get(id)`).
 * -------------------------------------------------------------------------
 */
function toStr(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v);
}

function applyValues(schema: FormGridSchema, values: ApiRow): FormGridSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((f) => {
        // checkbox tem defaultValue: string[] — este build nao usa o tipo, pula por seguranca.
        if (f.type === 'checkbox') return f;
        const v = f.name ? toStr(values[f.name]) : undefined;
        return v === undefined ? f : { ...f, defaultValue: v };
      }),
    })),
  };
}

export default function UpdatePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  /**
   * =============================================================================
   * BLOCO 3 — ESTADO DO COMPONENTE (id da rota + definição + envio)
   * =============================================================================
   *
   * `id` vem de `useParams()` com default `''` — é a chave da EDIÇÃO: entra no
   *   GET do registro e no PUT do submit. `navigate`/`toast` são os hooks de
   *   apoio usados no BLOCO 5.
   *
   * CAMPOS, POR JANELA DE TELA:
   *   form       -> `RenderForm` (meta + schema original, antes do
   *                 pré-preenchimento); serve para o título do toast;
   *   schema     -> schema JÁ COM os `defaultValue` injetados por `applyValues`
   *                 (BLOCO 2); é o que o `<FormGrid>` recebe;
   *   error      -> mensagem de falha de carga (destaca dois casos diferentes:
   *                 build ausente e registro inexistente — BLOCO 4);
   *   loading    -> true durante as duas requisições do `load`;
   *   submitting -> true durante o PUT; desabilita "Salvar";
   *   reloadKey  -> contador usado como `key` do `<form>`; incrementar remonta o
   *                 formulário e volta aos valores originais ("Desfazer
   *                 alteracoes").
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
   * BLOCO 4 — CARREGAMENTO (definição + registro, em paralelo)
   * =============================================================================
   *
   * O QUE FAZ, na ordem:
   *   1. `Promise.all` com DUAS requisições independentes — a definição do build
   *      (`formManagerView.getGrouped`, a view agrupada ordenada por
   *      `fc_sort_order`) e o registro atual (`userManagerTable.get(id)`).
   *      Rodam juntas porque nenhuma depende da outra: é o caminho mais curto;
   *   2. `normalizeList(defRaw).rows` -> `buildRenderSchema(rows)`; `null` aqui
   *      significa build inexistente/incompleto -> `error` com a mensagem da
   *      slug (NÃO é falha de rede);
   *   3. `normalizeItem(itemRaw)` -> `record`; sem registro -> outro `error`
   *      específico ("Usuario #id nao encontrado"), porque tela de edição sem o
   *      registro não tem como funcionar;
   *   4. `setForm(built)` guarda os metadados e `setSchema(applyValues(built.schema,
   *      record))` monta o schema pré-preenchido — a única diferença real em
   *      relação ao `CreatePage.tsx`.
   *
   * O `finally` sempre desliga `loading`, inclusive quando o `return` antecipado
   *   de um dos casos de erro acontece.
   *
   * A DEPENDÊNCIA `[id]` do `useCallback` é obrigatória: trocar o registro na
   *   URL precisa refazer as duas requisições.
   * -------------------------------------------------------------------------
   */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [defRaw, itemRaw] = await Promise.all([
        formManagerView.getGrouped(
          { fm_slug: [FORM_SLUG] },
          { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
        ),
        userManagerTable.get(id),
      ]);

      const { rows } = normalizeList(defRaw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setSchema(null);
        setError(`Nenhum formulario publicado para a slug "${FORM_SLUG}".`);
        return;
      }

      const record = normalizeItem<ApiRow>(itemRaw);
      if (!record) {
        setForm(null);
        setSchema(null);
        setError(`Usuario #${id} nao encontrado.`);
        return;
      }

      setForm(built);
      setSchema(applyValues(built.schema, record));
    } catch (err) {
      setForm(null);
      setSchema(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * =============================================================================
   * BLOCO 5 — HANDLER DE SUBMIT (validar -> converter -> atualizar -> voltar)
   * =============================================================================
   *
   * O QUE FAZ, no clique em "Salvar":
   *   1. `preventDefault` + validação NATIVA do `<form>` (`checkValidity` e, se
   *      inválido, `reportValidity`) — o formulário é `noValidate`;
   *   2. `formDataToPayload(el)` converte o `FormData` no corpo do PUT — o mesmo
   *      helper do `CreatePage.tsx` e do renderer genérico;
   *   3. `userManagerTable.update(id, payload)` -> PUT em
   *      `api/v1/user-manager/update/{id}`; o `id` sai da ROTA, não do corpo;
   *   4. sucesso -> `toast.success` e redirect para o DETALHE do próprio
   *      registro (confirma o que ficou gravado);
   *   5. falha -> `ApiError` vira `toast.error` com o detalhe de validação de
   *      campos (`errorDetail`) quando houver; erro não tipado vira mensagem
   *      genérica. O `finally` devolve `submitting` para `false`.
   *
   * DETALHE: o PUT substitui o registro inteiro no back-end, e o payload vem do
   *   formulário INTEIRO — por isso um campo que não estiver na grade (ex.:
   *   `password_hash`) não é enviado nem apagado por esta tela.
   *
   * A DEPENDÊNCIA `[id, form, navigate, toast]` do `useCallback` mantém o `id`
   *   atual no envio e o título do build no toast.
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
        await userManagerTable.update(id, payload);
        toast.success('Usuario atualizado.', { title: form?.meta.title ?? 'Atualizacao' });
        navigate(paths.v1.user.view(id));
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
    [id, form, navigate, toast],
  );

  /**
   * =============================================================================
   * BLOCO 6 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ, em 3 janelas:
   *   1. `<PageHeader>` — título com o id, subtítulo com o endpoint de update
   *      (PUT com o id na URL) e "Voltar" para o DETALHE do registro;
   *   2. estados de tela: `loading` -> `<LoadingOverlay />`; `error` ->
   *      `<EmptyState>` com a mensagem do BLOCO 4 (cobre build ausente e
   *      registro inexistente);
   *   3. cartão com o `<form>`: `<FormGrid schema={schema} />` (já com os
   *      `defaultValue` do registro) e a barra de ações com "Salvar" (submit,
   *      desabilitado durante `submitting`) e "Desfazer alteracoes"
   *      (`type="button"` + `reloadKey`, que remonta o formulário e restaura os
   *      valores originais).
   *
   * NÃO EXISTE estado por campo nesta página: o valor de cada campo mora dentro
   *   do componente de campo do `<FormGrid>`; a tela lê os valores UMA vez, no
   *   submit, via `FormData` (dentro de `formDataToPayload`, BLOCO 5).
   * -------------------------------------------------------------------------
   */
  return (
    <>
      <PageHeader
        title={`Editar usuario #${id}`}
        subtitle={`PUT api/v1/user-manager/update/${id}`}
      >
        <Link className="btn btn-outline-secondary" to={paths.v1.user.view(id)}>
          Voltar
        </Link>
      </PageHeader>

      {/* 2a. Carga das duas requisições do BLOCO 4: overlay cheio. */}
      {loading && <LoadingOverlay />}

      {/* 2b. Build ausente ou registro inexistente: EmptyState com a mensagem. */}
      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {/* 3. Formulário do build (já pré-preenchido) + ações Salvar/Desfazer. */}
      {!loading && !error && schema && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <form key={reloadKey} onSubmit={(e) => void handleSubmit(e)} noValidate>
              <FormGrid schema={schema} />
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setReloadKey((k) => k + 1)}
                >
                  Desfazer alteracoes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
