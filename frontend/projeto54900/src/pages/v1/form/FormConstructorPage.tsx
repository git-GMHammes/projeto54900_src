/**
 * =============================================================================
 * FILE HEADER — FormConstructorPage (construtor LEGADO da view; rota -claude)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Renderiza a ÁRVORE DE CADASTRO do módulo Form a partir da view
 *   `view_form_manager` (JSON) e grava, grupo a grupo, na API do módulo. A view
 *   devolve o formulário QUE DESCREVE o formulário: 4 grupos (`formulario`,
 *   `grupos`, `linhas`, `campos`) cujos campos são as colunas reais de
 *   `form_manager`/`form_groups`/`form_rows`/`form_fields`. Cada grupo vira um
 *   card com um `<FormGrid>` e um botão "Criar <grupo>".
 *
 * STATUS — PÁGINA LEGADA (ler antes de mexer):
 *   Este é o construtor ANTIGO, montado a partir de um seed, preservado em rota
 *   própria: `routes/v1/form.routes.tsx` marca explicitamente "NAO mexer".
 *     /v1/form-constructor-claude -> ESTA página
 *     /v1/form-constructor        -> FormBuilderPage (atual: introspecção do
 *                                   schema real + árvore + modal por nó)
 *   Aqui os campos NÃO são escolhidos pelo usuário: eles já vêm descritos na
 *   view. Evolução do construtor acontece no `FormBuilderPage`; esta página só
 *   precisa continuar funcionando.
 *
 * FLUXO (3 etapas):
 *   1. CARREGAR — `formManagerView.getGrouped({ fm_slug: ['form-constructor'] })`
 *      (POST em `/{version}/form-manager-view/get-grouped`) traz 1 linha por
 *      campo; `normalizeList` extrai `rows` e `buildConstructorSchemas` (BLOCO 4)
 *      agrupa por `fg_slug` em `ConstructorGroup[]` (slug/title/sortOrder/schema).
 *   2. DESENHAR — um card por grupo, com `<FormGrid schema={group.schema} />`
 *      dentro de um `<form>` próprio (cada grupo tem o seu botão).
 *   3. GRAVAR — o submit do grupo monta o payload com `formDataToPayload`
 *      (BLOCO 2) e chama `TARGET[slug].writer.create(...)` (BLOCO 1). Ao criar, o
 *      grupo FILHO é remontado (`bump`, BLOCO 5) para o `select` de `*_id`
 *      refazer o fetch e o registro novo aparecer na lista.
 *
 * DEPENDÊNCIAS (arquivos deste projeto que esta página consome):
 *   - `@/services/v1` (`formManagerView` + as 4 tabelas de escrita) — a view é
 *     read-only (`createResource(..., { mutations: false })`); quem grava são os
 *     services `form*Table`.
 *   - `@/services/formSchema` (`buildConstructorSchemas`, `ConstructorGroup`) —
 *     o adapter view -> `FormGridSchema`; é lá que `fc_*` vira prop de campo.
 *   - `@/components/ui/FormGrid/Input` (`<FormGrid>`) — todo campo é renderizado
 *     por schema; nenhum `<input>` é escrito à mão aqui.
 *   - `@/services/resourceFactory` (`ResourceWriter`) — o tipo do par
 *     leitura+escrita usado no mapa `TARGET`.
 *   - `@/utils/apiResult` (`normalizeList`), `@/hooks/useToast`,
 *     `@/services/http` (`ApiError`) e `@/components/global` (`PageHeader`,
 *     `EmptyState`, `LoadingOverlay`).
 *
 * CONSUMIDORES:
 *   - `src/routes/v1/form.routes.tsx` -> `/v1/form-constructor-claude` (lazy).
 *     É o ÚNICO consumidor: a página não exporta nada além do default.
 *
 * DOC: `src/markdown/geral/README_form_constructor.md` descreve o seed
 *   `FormConstructorSeeder`, o fluxo e as limitações conhecidas desta tela
 *   (atenção: o título daquele doc cita a rota `/v1/form-constructor`, que hoje
 *   é a página nova).
 *
 * COMO REPLICAR (formulário dinâmico que também GRAVA na própria API):
 *   1. Crie um `form_manager` (slug próprio) cujos grupos descrevam os campos da
 *      tabela de destino, via seed — é o caminho do `FormConstructorSeeder`.
 *   2. Carregue a view com `getGrouped({ fm_slug: [<slug>] })` e converta com um
 *      adapter equivalente a `buildConstructorSchemas`.
 *   3. Monte um mapa `<fg_slug> -> { writer, reload }` como o `TARGET`, apontando
 *      cada grupo para o service da tabela que ele descreve.
 *   4. Renderize um `<form>` + `<FormGrid>` por grupo e, no submit, monte o
 *      payload a partir do `FormData` e chame `writer.create`.
 *   5. Após criar um pai, remonte o `<FormGrid>` do filho (`key` + contador)
 *      para o select de FK re-buscar as opções.
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. A chave do `TARGET` é o `fg_slug` GRAVADO NO SEED — renomear o grupo no
 *      seed sem ajustar aqui faz o submit daquele card não fazer nada, em
 *      silêncio (`if (!target) return` do BLOCO 6).
 *   2. Cada card é um formulário independente: não há estado compartilhado entre
 *      grupos além de `reloadKeys`.
 *   3. Todo campo enviado vem do `<FormGrid>` (schema) — não introduza `<input>`
 *      manual nem dependa de `name` fixo no código.
 *   4. Depois de criar, `form.reset()` + `bump` — sem isso a tela segue exibindo
 *      dados já enviados e os selects de FK não veem o registro novo.
 * =============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import {
  formManagerView,
  formManagerTable,
  formGroupsTable,
  formRowsTable,
  formCamposTable,
} from '@/services/v1';
import { buildConstructorSchemas } from '@/services/formSchema';
import type { ConstructorGroup } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import type { ResourceWriter } from '@/services/resourceFactory';

/**
 * =============================================================================
 * BLOCO 1 — CONTRATO COM A VIEW (constantes de módulo)
 * =============================================================================
 *
 * `CONSTRUCTOR_SLUG` — slug do `form_manager` que a view devolve; é o ÚNICO
 *   filtro da busca. Sem ele (ou com o seed não rodado) a página mostra o erro
 *   com o comando do seeder.
 *
 * `TARGET` — mapa `fg_slug -> { writer, reload }`: a TABELA DE ROTEAMENTO do
 *   submit. Cada grupo do seed descreve UMA tabela do módulo Form, então cada
 *   card precisa saber onde gravar e o que recarregar depois:
 *     chave   o `fg_slug` gravado no seed (NÃO é o título do card)
 *     writer  service REST de escrita da tabela que o grupo descreve
 *     reload  slug do grupo FILHO que deve ser remontado após criar — é o que
 *             faz o `select` de FK (`form_manager_id`, `form_group_id`,
 *             `form_row_id`) re-buscar as opções
 *   `campos` é o último nível: não tem filho, logo não tem `reload` (e
 *   `bump(undefined)` simplesmente não faz nada — ver BLOCO 5).
 *
 * ATENÇÃO: por causa do `if (!target) return` do BLOCO 6, um `fg_slug` fora
 *   deste mapa vira um botão que não faz nada, sem erro na tela. Grupo novo no
 *   seed exige entrada aqui.
 * =============================================================================
 */

const CONSTRUCTOR_SLUG = 'form-constructor';

/** Ver descrição de `TARGET` no BLOCO 1 acima (mapa `fg_slug` -> writer + filho a recarregar). */
const TARGET: Record<string, { writer: ResourceWriter; reload?: string }> = {
  formulario: { writer: formManagerTable, reload: 'grupos' },
  grupos: { writer: formGroupsTable, reload: 'linhas' },
  linhas: { writer: formRowsTable, reload: 'campos' },
  campos: { writer: formCamposTable },
};

/**
 * =============================================================================
 * BLOCO 2 — PAYLOAD A PARTIR DO <form> (função auxiliar de módulo)
 * =============================================================================
 *
 * O QUE FAZ: percorre o `FormData` do `<form>` do card e devolve o objeto que
 *   vai para o `create` do service, com DUAS regras:
 *     1. chave terminando em `[]` -> checkbox: grava `1` quando o valor é `'1'` e
 *        ignora o resto (o `<FormGrid>` usa `name[]` para checkbox booleano);
 *     2. demais campos: valor passa por `trim()` e chave vazia é DESCARTADA (a
 *        API é `permit_empty`, então omitir preserva o default do banco).
 *
 * POR QUE NÃO USA A FUNÇÃO DE MESMO NOME DE `@/utils/formSubmit`:
 *   aquela versão transforma `campo[]` em ARRAY (checkbox múltiplo) e é a usada
 *   pelo submit do formulário gerado. Aqui o checkbox é um booleano único (0/1),
 *   então a regra muda. São duas funções homônimas com semânticas distintas — ao
 *   mexer em uma, verifique se a outra precisa do mesmo ajuste.
 *
 * A TER EM CONTA:
 *   - checkbox DESMARCADO não gera entrada no `FormData`: nenhum `0` vai no
 *     payload e o banco aplica o default da coluna;
 *   - se algum grupo passar a ter checkbox múltiplo, o `payload[key] = 1`
 *     silenciaria os demais valores — nesse caso, migre para a versão de
 *     `utils/formSubmit`.
 * =============================================================================
 */

function formDataToPayload(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form);
  const payload: Record<string, unknown> = {};

  for (const [rawKey, value] of fd.entries()) {
    if (typeof value !== 'string') continue;

    if (rawKey.endsWith('[]')) {
      // No construtor todo campo name[] e um checkbox booleano unico.
      const key = rawKey.slice(0, -2);
      if (value === '1') payload[key] = 1;
      continue;
    }

    const trimmed = value.trim();
    if (trimmed !== '') payload[rawKey] = trimmed;
  }

  return payload;
}

/**
 * =============================================================================
 * BLOCO 3 — ESTADO DO COMPONENTE
 * =============================================================================
 *
 * DADOS (o que a view devolveu):
 *   `groups`   `ConstructorGroup[]` (slug/title/sortOrder/schema) já convertido
 *              por `buildConstructorSchemas`; `null` = ainda não carregado
 *              (diferente de `[]` = carregado e vazio)
 *   `loading`  overlay cheio enquanto a view responde
 *   `error`    falha de API OU view sem linhas (o caso "seed não rodado" também
 *              cai aqui, com o comando no texto — ver BLOCO 4)
 *
 * UI (controle de interação):
 *   `submitting`  slug do grupo com submit em andamento: desabilita só o botão
 *                 daquele card e troca o rótulo para "Enviando..."
 *   `reloadKeys`  contador por slug de grupo; entra no `key` do `<FormGrid>`
 *                 (BLOCO 7) para forçar o remount do grupo filho. Não guarda
 *                 dado nenhum — é só o "número da versão" do componente.
 *
 * POR QUE ESSE É O ESTADO TODO: a página é orquestração pura — não tem
 *   formulário próprio, rascunho nem cache de campo. Cada `<FormGrid>` cuida do
 *   seu próprio DOM; à página interessa apenas quais grupos existem, qual está
 *   enviando e o que precisa ser remontado depois de criar.
 * -------------------------------------------------------------------------
 */
export default function FormConstructorPage() {
  const toast = useToast();
  // Dados: definição convertida + estado de carga/erro da view.
  const [groups, setGroups] = useState<ConstructorGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // UI: qual grupo está enviando e a "versão" de cada grupo (remount do filho).
  const [reloadKeys, setReloadKeys] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  /**
   * =============================================================================
   * BLOCO 4 — CARREGAMENTO DA ÁRVORE (view -> schemas)
   * =============================================================================
   *
   * O QUE FAZ: busca a definição na VIEW e converte para os 4 schemas.
   *   1. `formManagerView.getGrouped(filtro, paginação)` — POST em
   *      `/{version}/form-manager-view/get-grouped`; o `fm_slug` vai no CORPO
   *      (filtro) e `limit/sort/order` na QUERY. `limit: 1000` é folgado de
   *      propósito: a view devolve 1 linha por CAMPO, e cortar a paginação
   *      perderia campos em silêncio.
   *   2. `normalizeList(raw)` -> `rows` crus (o envelope da resposta varia).
   *   3. `buildConstructorSchemas(rows)` (`@/services/formSchema`) agrupa por
   *      `fg_slug`, ordena por `sort_order` e converte cada `fc_*` na prop do
   *      `AnyFieldSchema` — o resultado é o que o `<FormGrid>` consome direto.
   *      A ordem dos cards na tela sai daqui (por `sortOrder`), não do JSX.
   *
   * ERRO: dois casos caem no mesmo `error` —
   *   - falha de rede/API -> `ApiError.message`;
   *   - view SEM linhas  -> mensagem acionável com o comando do seed
   *     (`FormConstructorSeeder`), porque a causa provável é o seed não rodado.
   *
   * DETALHES: `setLoading(true/false)` envolve tudo, e o `finally` garante a
   *   saída do overlay mesmo no erro; `groups` volta a `null` no erro de API,
   *   mas fica `[]` no caso "view vazia" — nos dois a UI mostra o `EmptyState`
   *   (BLOCO 7).
   * -------------------------------------------------------------------------
   */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // `fm_slug` no corpo (filtro da view); paginação na query.
      const raw = await formManagerView.getGrouped(
        { fm_slug: [CONSTRUCTOR_SLUG] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
      );
      const { rows } = normalizeList(raw);
      const built = buildConstructorSchemas(rows);
      setGroups(built);
      // View vazia não é "lista vazia": é definição ausente -> dá o comando do seed.
      if (built.length === 0) {
        setError(
          'A view nao retornou linhas para "form-constructor". Rode o seed: ' +
          'podman compose exec php php spark db:seed FormConstructorSeeder',
        );
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao carregar o construtor.';
      setError(msg);
      setGroups(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito único: a definição é lida uma vez ao montar (e pelo botão "Recarregar").
  useEffect(() => {
    void load();
  }, [load]);

  /**
   * =============================================================================
   * BLOCO 5 — RECARGA DO SELECT DEPENDENTE (`bump`)
   * =============================================================================
   *
   * O QUE FAZ: incrementa um contador por slug de grupo. Esse contador entra no
   *   `key` do `<FormGrid>` daquele grupo (BLOCO 7) e mudar a `key` faz o React
   *   DESMONTAR e MONTAR o componente de novo.
   *
   * POR QUE ISSO É NECESSÁRIO (e por que a `key` é a solução):
   *   os campos `*_id` são `select` REMOTOS — o próprio `<FormGrid>` faz o fetch
   *   das opções UMA vez, na montagem. Depois de criar, por exemplo, um
   *   `form_manager`, o `select` de `form_manager_id` do grupo `linhas`
   *   continuaria com a lista antiga (sem o registro novo). Remontar é a forma
   *   mais simples de forçar nova busca sem que o `<FormGrid>` precise de estado
   *   de dependência. Sintoma clássico de bug aqui: registro criado que "não
   *   aparece" no select — quase sempre é o `bump` do pai não sendo chamado.
   *
   * CUIDADOS:
   *   - `slug` indefinido é no-op: é assim que o grupo `campos` (último nível,
   *     sem filho e sem `reload` no `TARGET`) não faz nada.
   *   - O remount descarta o conteúdo do grupo filho — efeito desejado (começar
   *     limpo), mas também apaga qualquer coisa digitada nele antes do submit do
   *     pai.
   * -------------------------------------------------------------------------
   */
  const bump = useCallback((slug: string | undefined) => {
    if (!slug) return;
    setReloadKeys((prev) => ({ ...prev, [slug]: (prev[slug] ?? 0) + 1 }));
  }, []);

  /**
   * =============================================================================
   * BLOCO 6 — HANDLER DE SUBMIT (um por grupo, por `currying`)
   * =============================================================================
   *
   * O QUE FAZ: `handleSubmit(slug)` DEVOLVE o handler do `<form>` daquele grupo —
   *   é esse `currying` que permite ao JSX usar
   *   `onSubmit={(e) => void handleSubmit(group.slug)(e)}` sem precisar de 4
   *   funções nem de um `if (slug === ...)`.
   *
   * PASSO A PASSO DA EXECUÇÃO:
   *   1. `preventDefault()` — nada de navegação: tudo é via fetch.
   *   2. `TARGET[slug]` — sem entrada no mapa, sai em silêncio (ver BLOCO 1).
   *   3. `formDataToPayload(form)` — monta o corpo (BLOCO 2).
   *   4. `target.writer.create(payload)` — POST no service daquela tabela.
   *   5. Leitura TOLERANTE do id devolvido (`res.data.id`): o envelope da API
   *      varia, e o id só serve para a mensagem de sucesso — se não vier, mostra
   *      `#?` em vez de falhar.
   *   6. Sucesso -> toast com o id -> `form.reset()` (limpa o card enviado) ->
   *      `bump(target.reload)` (remonta o grupo filho, BLOCO 5).
   *
   * POR QUE O TRATAMENTO DE ERRO É TÃO DETALHADO: o `ApiError` do backend traz,
   *   além da mensagem, um bag `data.errors` (validação por CAMPO). O handler
   *   junta esses itens numa linha (`mensagem — erro1 | erro2`) porque o toast é
   *   o único lugar onde o usuário vê o motivo — sem isso, ele saberia apenas
   *   "não criou". Erro não-API (rede/timeout) cai na mensagem genérica.
   *
   * `submitting` é setado/limpo AQUI (o `finally` garante a limpeza) e é o que
   *   desabilita o botão daquele card enquanto a requisição está no ar.
   * -------------------------------------------------------------------------
   */
  const handleSubmit = useCallback(
    (slug: string) => async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // Roteamento do grupo -> service de escrita (BLOCO 1).
      const target = TARGET[slug];
      if (!target) return;

      const form = event.currentTarget;
      const payload = formDataToPayload(form);

      setSubmitting(slug);
      try {
        // `create` é o POST do service daquele grupo. O retorno serve apenas para
        // a mensagem de sucesso — nunca para repopular o formulário.
        const res: unknown = await target.writer.create(payload);
        const record: Record<string, unknown> =
          res && typeof res === 'object' ? (res as Record<string, unknown>) : {};
        const data: Record<string, unknown> =
          record.data && typeof record.data === 'object'
            ? (record.data as Record<string, unknown>)
            : {};
        const rawId = data.id;
        const id = typeof rawId === 'number' || typeof rawId === 'string' ? rawId : '?';
        toast.success(`${slug}: registro #${id} criado.`, { title: 'Construtor de formularios' });
        // Limpa o card enviado e REMONTA o grupo filho para o select de FK
        // enxergar o registro novo (BLOCO 5).
        form.reset();
        bump(target.reload);
      } catch (err) {
        if (err instanceof ApiError) {
          // `data.errors` é o bag de validação por campo do backend; os itens são
          // achatados numa linha porque o toast é a única superfície de erro.
          const errorsBag =
            err.data && typeof err.data === 'object'
              ? (err.data as Record<string, unknown>).errors
              : null;
          const messages =
            errorsBag && typeof errorsBag === 'object'
              ? Object.values(errorsBag as Record<string, unknown>).filter(
                (v): v is string => typeof v === 'string',
              )
              : [];
          const extra = messages.length > 0 ? ` — ${messages.join(' | ')}` : '';
          toast.error(`${slug}: ${err.message}${extra}`, { title: 'Erro ao criar' });
        } else {
          toast.error(`${slug}: falha inesperada.`, { title: 'Erro ao criar' });
        }
      } finally {
        setSubmitting(null);
      }
    },
    [toast, bump],
  );

  /**
   * =============================================================================
   * BLOCO 7 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ: 4 janelas, na ordem:
   *   1. `<PageHeader>` — título fixo (não vem da view) + "Recarregar" (refaz o
   *      BLOCO 4 inteiro).
   *   2. `loading` -> `<LoadingOverlay />` cheio: é a carga da ESTRUTURA da tela.
   *   3. `error` -> `<EmptyState>` (a mensagem pode ser a do seed — BLOCO 4).
   *   4. Um card por grupo, cada um com o SEU `<form>` e o SEU `<FormGrid>`.
   *
   * DETALHES QUE PARECEM DETALHE (e são o coração da tela):
   *   - `key={`${group.slug}-${reloadKeys[group.slug] ?? 0}`}`: a `key` do
   *     `<FormGrid>` carrega o contador do BLOCO 5 — é por aqui que o remount (e
   *     a nova busca dos selects de FK) acontece. Tirar isso quebra a ligação
   *     pai -> filho sem nenhum erro visível.
   *   - `onSubmit={(e) => void handleSubmit(group.slug)(e)}`: cada card recebe o
   *     SEU handler (currying do BLOCO 6); o `void` marca que a promise é
   *     tratada dentro do handler (com toast), e não no JSX.
   *   - `disabled={submitting === group.slug}`: só o card que está enviando fica
   *     bloqueado; os outros continuam utilizáveis.
   *   - O botão "Limpar" (`type="reset"`) e o `form.reset()` do handler resolvem
   *     o mesmo caso por dois caminhos (nativo do HTML e React) — de propósito.
   *
   * COMO REAPROVEITAR: para acrescentar uma tabela ao construtor, crie o grupo no
   *   seed e a entrada no `TARGET` — este JSX não muda.
   * -------------------------------------------------------------------------
   */
  return (
    <>
      {/* Janela 1 — cabeçalho fixo + recarregar a view. */}
      <PageHeader
        title="Construtor de Formularios"
        subtitle="view_form_manager -> FormGrid -> API do modulo Form"
      >
        <button className="btn btn-outline-secondary" onClick={() => void load()} disabled={loading}>
          Recarregar
        </button>
      </PageHeader>

      {/* Janela 2 — carregando a estrutura da tela (view + schemas). */}
      {loading && <LoadingOverlay />}

      {/* Janela 3 — erro de API ou view sem linhas (a mensagem traz o comando do seed). */}
      {error && !loading && (
        <EmptyState title="Construtor indisponivel" description={error} />
      )}

      {/* Janela 4 — um card por grupo; cada card é um formulário independente. */}
      {!loading &&
        !error &&
        groups?.map((group) => (
          <div className="card border-0 shadow-sm mb-4" key={group.slug}>
            <div className="card-body p-4">
              {/* A key carrega o contador do bump: mudar a key remonta o FormGrid. */}
              <form onSubmit={(e) => void handleSubmit(group.slug)(e)} noValidate>
                <FormGrid
                  key={`${group.slug}-${reloadKeys[group.slug] ?? 0}`}
                  schema={group.schema}
                />
                {/* Só o card em envio fica bloqueado; "Limpar" é o reset nativo do HTML. */}
                <div className="d-flex gap-2 mt-4 pt-3 border-top">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting === group.slug}
                  >
                    {submitting === group.slug ? 'Enviando...' : `Criar ${group.title}`}
                  </button>
                  <button type="reset" className="btn btn-outline-secondary">
                    Limpar
                  </button>
                </div>
              </form>
            </div>
          </div>
        ))}
    </>
  );
}
