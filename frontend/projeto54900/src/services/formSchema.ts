/**
 * =============================================================================
 * FILE HEADER — formSchema (services) — da view achatada ao schema do FormGrid
 * =============================================================================
 *
 * O QUE FAZ:
 *   Converte as linhas ACHATADAS da view `view_form_manager` na estrutura que o
 *   `<FormGrid>` entende. É o adaptador entre "o formulário como dados" (banco)
 *   e "o formulário como tela" (React).
 *
 * A MATÉRIA-PRIMA (por que uma linha = um campo):
 *   a view devolve UMA LINHA POR CAMPO, com a hierarquia repetida em colunas
 *   prefixadas:
 *     fm_ -> form_manager  (o formulário: slug, título, submit_endpoint, status)
 *     fg_ -> form_groups   (grupo visual: título, ícone, ordem)
 *     fr_ -> form_rows     (linha do grid Bootstrap: ordem, gutter)
 *     fc_ -> form_fields   (o campo: tipo, nome, label, validação, ordem)
 *   Ou seja: tudo o que o construtor monta no banco chega aqui já resolvido, e
 *   este arquivo só precisa reagrupar e traduzir nomes de coluna -> props.
 *
 * DOIS PRODUTOS, MESMA MATÉRIA-PRIMA (o que explica os dois blocos finais):
 *   1. `buildConstructorSchemas` (BLOCO 4) -> UM schema POR GRUPO. É o produto do
 *      CONSTRUTOR: a tela mostra os grupos separados, um formulário por camada;
 *   2. `buildRenderSchema` (BLOCO 5) -> UM schema ÚNICO com todos os grupos
 *      concatenados + a metadata do formulário (destino e método do submit). É o
 *      produto do RENDERER: o formulário que o usuário final preenche.
 *
 * DEPENDÊNCIAS: `@/components/ui/FormGrid/Input` (tipos `AnyFieldSchema` e
 *   `FormGridSchema`) e `@/types/api` (`ApiRow`). Nada de HTTP aqui: este arquivo
 *   é transformação PURA de dados (não chama API, não tem estado).
 *
 * CONSUMIDORES (todas as telas que mostram formulário a partir do banco):
 *   - `pages/v1/form/FormConstructorPage.tsx` (construtor legado);
 *   - `pages/v1/form/FormRendererPage.tsx` (rota `/v1/form/:slug`);
 *   - `pages/v1/user/user-manager/CreatePage.tsx` e `UpdatePage.tsx` (builds
 *     fixos `cadastro-usuario` e `atualizar-usuario`);
 *   - o passo 1 (Login) de `pages/v1/user/register/RegisterPage.tsx`.
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. coluna `*_json` pode chegar como STRING (driver MySQLi) ou como OBJETO já
 *      decodificado — é por isso que existe o helper `json` (BLOCO 1). Ler essas
 *      colunas direto (sem o helper) quebra em um dos dois casos;
 *   2. campo novo na definição precisa de DUAS coisas para aparecer: a coluna na
 *      view e o ramo correspondente em `buildField` (BLOCO 3). Só a coluna não
 *      basta se o tipo for novo;
 *   3. `undefined` é o valor de "prop não informada" (BLOCO 1): as funções de
 *      montagem evitam escrever chave vazia no schema — quem aplica o default é
 *      o componente de campo;
 *   4. a ordem visual NÃO é a ordem das linhas da view: ela vem de `sort_order`
 *      em três níveis (grupo, linha, campo) e é aplicada no fim do agrupamento;
 *   5. a metadata do formulário vive nas colunas `fm_*`, que se REPETEM em todas
 *      as linhas — por isso o BLOCO 5 pega a primeira linha que trouxer `fm_slug`.
 *
 * COMO REPLICAR PARA OUTRO MODELO HIERÁRQUICO:
 *   1. identifique os prefixos de cada nível na sua view e os ids que os ligam;
 *   2. troque os nomes `fg_`/`fr_`/`fc_` no agrupamento (BLOCO 4) mantendo a mesma
 *      ideia: acumular em `Map` por id de pai e guardar a ordem junto do dado;
 *   3. escreva um `buildXField` por tipo (BLOCO 3 é o exemplo) e uma função de
 *      metadata, se o seu formulário for publicado.
 * =============================================================================
 */

import type { AnyFieldSchema, FormGridSchema } from '@/components/ui/FormGrid/Input';
import type { ApiRow } from '@/types/api';

export interface ConstructorGroup {
  slug: string;
  title: string;
  sortOrder: number;
  schema: FormGridSchema;
}

// --- helpers de leitura ------------------------------------------------------

/**
 * =============================================================================
 * BLOCO 1 — HELPERS DE LEITURA (normalização de valores crus)
 * =============================================================================
 *
 * O QUE FAZEM: convertem o valor de UMA coluna da view para o tipo que o schema
 *   espera. A view manda tudo como texto quando o driver é o MySQLi, então a
 *   regra é: NUNCA confiar no tipo recebido — normalizar sempre.
 *
 * UM A UM:
 *   str  -> string não vazia ou `undefined` (string vazia conta como AUSENTE;
 *           número vira texto);
 *   int  -> número finito ou `undefined` (aceita `'12'`, rejeita `''` e lixo);
 *   bool -> flag: verdadeiro só para `1`, `'1'` ou `true` (é assim que o TINYINT
 *           chega da API);
 *   json -> `JSON.parse` tolerante: `null`/`''`/JSON inválido -> `undefined`,
 *           enquanto objeto já pronto passa direto;
 *   strList -> lista de strings a partir de uma coluna JSON; descarta itens de
 *           outro tipo e devolve `undefined` quando a lista fica vazia.
 *
 * POR QUE `undefined` SIGNIFICA "NÃO EXISTE": quem monta o campo só escreve a
 *   prop quando o valor veio definido (helper `set`, BLOCO 3). Assim o schema
 *   não carrega chave vazia, e o componente de campo aplica o próprio default.
 * -------------------------------------------------------------------------
 */
function str(v: unknown): string | undefined {
  if (typeof v === 'string') return v.length > 0 ? v : undefined;
  if (typeof v === 'number') return String(v);
  return undefined;
}

function int(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function bool(v: unknown): boolean {
  return v === 1 || v === '1' || v === true;
}

function json(v: unknown): unknown {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'string') {
    try {
      return JSON.parse(v) as unknown;
    } catch {
      return undefined;
    }
  }
  return v;
}

function strList(v: unknown): string[] | undefined {
  const parsed = json(v);
  if (!Array.isArray(parsed)) return undefined;
  const out = parsed.filter((x): x is string => typeof x === 'string');
  return out.length > 0 ? out : undefined;
}

/**
 * =============================================================================
 * BLOCO 2 — OPÇÕES E LARGURA DA COLUNA
 * =============================================================================
 *
 * `RawOption` — forma normalizada de UMA opção de `radio`/`checkbox`/`select`:
 *   `id`, `value` e `label`. É o que os componentes de opção consomem.
 *
 * `optionList(v)` — transforma a coluna JSON de opções nessa lista. O que faz de
 *   importante:
 *   1. aceita o valor vindo de `value` OU de `id` (as duas grafias existem nas
 *      definições gravadas), com `label` caindo para `nome` ou para o próprio
 *      valor;
 *   2. gera `id` sintético (`opt_0`, `opt_1`, ...) quando faltar — o React exige
 *      chave, e uma opção sem id não pode quebrar a tela;
 *   3. ignora item que não seja objeto ou que não tenha valor utilizável;
 *   4. devolve `undefined` para lista vazia.
 *
 * `clampCol(v)` — largura da coluna no grid: inteiro preso entre 1 e 12, com 12
 *   quando a coluna vier vazia ou inválida. É a garantia de que `col` nunca sai
 *   fora do grid do Bootstrap.
 * -------------------------------------------------------------------------
 */
interface RawOption {
  id: string;
  value: string;
  label: string;
}

function optionList(v: unknown): RawOption[] | undefined {
  const parsed = json(v);
  if (!Array.isArray(parsed)) return undefined;
  const out: RawOption[] = [];
  parsed.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) return;
    const rec = item as Record<string, unknown>;
    const value = str(rec.value) ?? str(rec.id);
    if (value === undefined) return;
    out.push({
      id: str(rec.id) ?? `opt_${i}`,
      value,
      label: str(rec.label) ?? str(rec.nome) ?? value,
    });
  });
  return out.length > 0 ? out : undefined;
}

function clampCol(v: unknown): number {
  const n = int(v) ?? 12;
  return Math.min(12, Math.max(1, Math.trunc(n)));
}

// --- construcao do campo ---------------------------------------------------

/**
 * =============================================================================
 * BLOCO 3 — `buildField`: UMA LINHA DA VIEW -> UM CAMPO DO FORMGRID
 * =============================================================================
 *
 * O QUE FAZ: recebe UMA linha da view (um campo, colunas `fc_*`) e devolve o
 *   objeto de props do componente de campo correspondente. O `type`
 *   (`fc_field_type`) é a chave de tudo: ele vira `type` no schema e escolhe o
 *   RAMO de props que será montado.
 *
 * `MASKED_TYPES` — tipos com máscara própria (`cpf`, `cnpj`, `phone`, `cep`,
 *   `data`, `hora`, `moeda`, `pis`, `placa`, `titulo`, `cnh`, `processo`,
 *   `renavam`, `sei`). Serve para o ramo final saber quem NÃO é texto comum.
 *
 * COMO MONTA (leia nesta ordem):
 *   1. `draft` começa com `type` e `col` (largura já presa por `clampCol`);
 *   2. o helper local `set(key, value)` só escreve quando o valor existe — é ele
 *      que mantém o schema enxuto (ver BLOCO 1);
 *   3. BASE COMUM: `label`, `id` (de `fc_field_key`), `name`, `placeholder`,
 *      `defaultValue` e as flags `required`, `disabled`, `readOnly`, `hidden`;
 *   4. `fc_help_text` vira `title`: o FormGrid não tem slot de texto de ajuda, e
 *      a informação aparece como tooltip em vez de ser perdida;
 *   5. POR TIPO, entram as props específicas:
 *      textarea -> `rows`, limites de tamanho, contador e os bloqueios de
 *                  caractere (`noNumbers`, `noLetters`, `noSpecialChars`);
 *      senha    -> limites e `strongPassword`/`doubleField`;
 *      select   -> lê `fc_select_config_json` (`src`, `valueKey`, `maxVisible`,
 *                  `labelTemplate`, `labelKey`, `colorKey`, `fillFields`); se NÃO houver `src`, cai nas
 *                  opções inline de `fc_options_json` com `valueKey`/`labelKey`
 *                  fixos em 'value'/'label';
 *      radio / checkbox -> opções (lista vazia é aceita) e `inline`;
 *      data     -> `min`/`max`;  hora -> `comSegundos`;
 *      demais   -> `pattern`, limites, `inputMode`, `autoComplete`, bloqueios de
 *                  caractere e, em `text`/`password`, a `datalist`; em `email`,
 *                  os `allowedDomains`.
 *
 * NOTA SOBRE O FINAL DO RAMO PADRÃO: o último `if` reajusta `draft.type` para
 *   respeitar o contrato de `TextFieldSchema.type` ('text' | 'password') nos
 *   campos de texto comuns. Mexer nele exige conferir os tipos aceitos pelo
 *   `<FormGrid>` em `components/ui/FormGrid/Input`.
 *
 * AO ACRESCENTAR UM TIPO NOVO NO FORMGRID: acrescente o ramo aqui E a coluna na
 *   view (`fc_*`) — sem isso o campo chega sem as props específicas.
 * -------------------------------------------------------------------------
 */
const MASKED_TYPES = new Set([
  'cpf', 'cnpj', 'phone', 'cep', 'data', 'hora', 'moeda', 'pis', 'placa',
  'titulo', 'cnh', 'processo', 'renavam', 'sei',
]);

function buildField(row: ApiRow): AnyFieldSchema {
  const type = str(row.fc_field_type) ?? 'text';

  // Base comum a (quase) todos os tipos.
  const draft: Record<string, unknown> = {
    type,
    col: clampCol(row.fc_col),
  };

  const set = (key: string, value: unknown): void => {
    if (value !== undefined) draft[key] = value;
  };

  set('label', str(row.fc_label));
  set('id', str(row.fc_field_key));
  set('name', str(row.fc_field_name));
  set('placeholder', str(row.fc_placeholder));
  set('defaultValue', str(row.fc_default_value));
  // FormGrid nao tem slot de ajuda: help_text vira `title` no schema, exibido
  // so no icone de tooltip (components/ui/FormGrid/FieldTooltip) - nunca como
  // atributo title nativo do elemento renderizado.
  set('title', str(row.fc_help_text));
  if (bool(row.fc_required)) set('required', true);
  if (bool(row.fc_disabled)) set('disabled', true);
  if (bool(row.fc_read_only)) set('readOnly', true);
  if (bool(row.fc_is_hidden)) set('hidden', true);

  if (type === 'textarea') {
    set('rows', int(row.fc_rows_qty));
    set('maxLength', int(row.fc_max_length));
    set('minLength', int(row.fc_min_length));
    if (bool(row.fc_show_counter)) set('showCounter', true);
    if (bool(row.fc_no_numbers)) set('noNumbers', true);
    if (bool(row.fc_no_letters)) set('noLetters', true);
    if (bool(row.fc_no_special_chars)) set('noSpecialChars', true);
  } else if (type === 'senha') {
    set('minLength', int(row.fc_min_length));
    set('maxLength', int(row.fc_max_length));
    if (bool(row.fc_strong_password)) set('strongPassword', true);
    if (bool(row.fc_double_field)) set('doubleField', true);
  } else if (type === 'select') {
    const cfg = json(row.fc_select_config_json);
    if (cfg && typeof cfg === 'object') {
      const rec = cfg as Record<string, unknown>;
      set('src', str(rec.src));
      set('valueKey', str(rec.valueKey));
      set('maxVisible', int(rec.maxVisible));
      set('colorKey', str(rec.colorKey));
      if (typeof rec.labelTemplate === 'string') set('labelTemplate', rec.labelTemplate);
      if (Array.isArray(rec.labelKey) || typeof rec.labelKey === 'string') {
        set('labelKey', rec.labelKey);
      }
      if (rec.fillFields && typeof rec.fillFields === 'object' && !Array.isArray(rec.fillFields)) {
        const fill = Object.fromEntries(
          Object.entries(rec.fillFields as Record<string, unknown>).filter(
            (e): e is [string, string] => typeof e[1] === 'string' && e[1] !== '',
          ),
        );
        if (Object.keys(fill).length > 0) set('fillFields', fill);
      }
    }
    const opts = optionList(row.fc_options_json);
    if (draft.src === undefined && opts) {
      set('options', opts);
      set('valueKey', 'value');
      set('labelKey', 'label');
    }
  } else if (type === 'radio' || type === 'checkbox') {
    set('options', optionList(row.fc_options_json) ?? []);
    if (bool(row.fc_inline)) set('inline', true);
  } else if (type === 'data' || type === 'datahora') {
    set('min', str(row.fc_min_date));
    set('max', str(row.fc_max_date));
  } else if (type === 'hora') {
    if (bool(row.fc_with_seconds)) set('comSegundos', true);
  } else {
    // text / password / email / mascarados
    set('pattern', str(row.fc_pattern));
    set('maxLength', int(row.fc_max_length));
    set('minLength', int(row.fc_min_length));
    set('inputMode', str(row.fc_input_mode));
    set('autoComplete', str(row.fc_autocomplete));
    if (bool(row.fc_no_numbers)) set('noNumbers', true);
    if (bool(row.fc_no_letters)) set('noLetters', true);
    if (bool(row.fc_no_special_chars)) set('noSpecialChars', true);
    if (type === 'text' || type === 'password') {
      set('datalist', strList(row.fc_datalist_json));
    }
    if (type === 'email') {
      set('allowedDomains', strList(row.fc_allowed_domains_json));
    }
    if (!MASKED_TYPES.has(type) && type !== 'email' && type !== 'password') {
      // TextFieldSchema.type aceita apenas 'text' | 'password'
      draft.type = type === 'text' ? 'text' : draft.type;
    }
  }

  return draft as unknown as AnyFieldSchema;
}

// --- agrupamento ---------------------------------------------------------

/**
 * =============================================================================
 * BLOCO 4 — `buildConstructorSchemas`: AGRUPAR (produto do CONSTRUTOR)
 * =============================================================================
 *
 * O QUE FAZ: recebe as linhas achatadas da view e devolve um array de
 *   `ConstructorGroup` — UM por grupo do formulário, cada um com o schema do
 *   FormGrid daquele grupo. É o produto usado pelo construtor (um formulário por
 *   camada, empilhados na tela).
 *
 * COMO AGRUPA:
 *   1. percorre TODAS as linhas uma única vez, acumulando em `Map`s: primeiro por
 *      `fg_id` (grupo) e depois por `fr_id` (linha do grid) — uma linha da view
 *      pertence a um grupo e a uma linha;
 *   2. linha sem os três ids (`fg_id`, `fr_id`, `fc_id`) é IGNORADA: sem eles não
 *      há como posicionar o campo;
 *   3. guarda a ORDEM junto do dado (`sortOrder` do grupo, `order` da linha e do
 *      campo) em vez de ordenar a cada inserção — a ordenação acontece no fim;
 *   4. monta o schema do grupo com as linhas ordenadas e, na PRIMEIRA linha,
 *      acrescenta `sectionTitle` com o título do grupo — é o que dá o cabeçalho
 *      visível de cada grupo;
 *   5. ordena os grupos por `sortOrder` antes de devolver.
 *
 * DEFAULTS QUANDO FALTA DADO: slug cai para `grupo-<id>`, título para 'Grupo' e
 *   as ordens caem para os próprios ids — o formulário continua montável mesmo
 *   com definição incompleta.
 *
 * COMO REAPROVEITAR: é o adaptador de qualquer view achatada com hierarquia de
 *   ids. Troque os prefixos `fg_`/`fr_`/`fc_` pelos do seu modelo e mantenha a
 *   ideia: acumular por id do pai e ordenar no final.
 * -------------------------------------------------------------------------
 */
interface GroupAcc {
  slug: string;
  title: string;
  sortOrder: number;
  rows: Map<number, { order: number; fields: { order: number; field: AnyFieldSchema }[] }>;
}

export function buildConstructorSchemas(rows: readonly ApiRow[]): ConstructorGroup[] {
  const groups = new Map<number, GroupAcc>();

  for (const row of rows) {
    const groupId = int(row.fg_id);
    const rowId = int(row.fr_id);
    const campoId = int(row.fc_id);
    if (groupId === undefined || rowId === undefined || campoId === undefined) continue;

    let g = groups.get(groupId);
    if (!g) {
      g = {
        slug: str(row.fg_slug) ?? `grupo-${groupId}`,
        title: str(row.fg_title) ?? 'Grupo',
        sortOrder: int(row.fg_sort_order) ?? groupId,
        rows: new Map(),
      };
      groups.set(groupId, g);
    }

    let r = g.rows.get(rowId);
    if (!r) {
      r = { order: int(row.fr_sort_order) ?? rowId, fields: [] };
      g.rows.set(rowId, r);
    }

    r.fields.push({ order: int(row.fc_sort_order) ?? r.fields.length, field: buildField(row) });
  }

  return [...groups.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((g) => {
      const orderedRows = [...g.rows.values()].sort((a, b) => a.order - b.order);
      const schema: FormGridSchema = {
        rows: orderedRows.map((r, idx) => {
          const fields = [...r.fields].sort((a, b) => a.order - b.order).map((f) => f.field);
          return idx === 0 ? { sectionTitle: g.title, fields } : { fields };
        }),
      };
      return { slug: g.slug, title: g.title, sortOrder: g.sortOrder, schema };
    });
}

// --- renderizador (formulario real) --------------------------------------
// Mesma materia-prima do construtor, alvo diferente: em vez de 4 formularios
// (um por camada), devolve UM formulario so — as linhas de todos os grupos
// concatenadas num unico FormGridSchema — mais a metadata de form_manager
// (para onde / como enviar). Consumido por FormRendererPage (/v1/form/:slug).

/**
 * =============================================================================
 * BLOCO 5 — `buildRenderSchema`: O FORMULÁRIO PUBLICADO (produto do RENDERER)
 * =============================================================================
 *
 * O QUE FAZ: usa a MESMA matéria-prima do BLOCO 4 e produz UM formulário só — as
 *   linhas de todos os grupos concatenadas num único `FormGridSchema` — mais a
 *   metadata de `form_manager` (para onde e como enviar). É o que a rota
 *   `/v1/form/:slug` renderiza.
 *
 * TIPOS:
 *   `RenderFormMeta` -> slug, title, description, submitEndpoint, httpMethod e
 *     status do build. É daqui que saem o título da tela, o destino do submit e
 *     o método HTTP (já em MAIÚSCULAS, com default 'POST');
 *   `RenderForm`     -> o par `{ meta, schema }` que as páginas consomem.
 *
 * COMO MONTA:
 *   1. chama `buildConstructorSchemas` (BLOCO 4) — o agrupamento é o mesmo, o que
 *      muda é o destino do resultado;
 *   2. `groups.length === 0` -> devolve `null`: não há formulário publicado. É
 *      este `null` que a página converte em "slug sem formulário" (e NÃO em erro
 *      de rede — a distinção está no consumidor);
 *   3. a metadata vem da PRIMEIRA linha que trouxer `fm_slug`, com queda para a
 *      linha 0 — as colunas `fm_*` se repetem em todas as linhas da view;
 *   4. concatena as linhas de todos os grupos (`flatMap`) num schema único, que é
 *      o formulário completo na ordem dos grupos.
 *
 * QUEM CONSOME: `FormRendererPage.tsx` (`/v1/form/:slug`) e os builds fixos das
 *   páginas de recurso (`cadastro-usuario`/`atualizar-usuario` no user-manager) e
 *   do `RegisterPage.tsx`. Todos usam o mesmo par `meta`/`schema`.
 * -------------------------------------------------------------------------
 */
export interface RenderFormMeta {
  slug: string;
  tableName?: string | undefined;
  title: string;
  description?: string | undefined;
  submitEndpoint?: string | undefined;
  httpMethod: string;
  status?: string | undefined;
}

export interface RenderForm {
  meta: RenderFormMeta;
  schema: FormGridSchema;
}

/**
 * Fonte unica de verdade de "este formulario pode ser preenchido/enviado
 * agora?" — status precisa ser exatamente 'active' (draft/inactive/ausente
 * bloqueiam). Usada por toda pagina que renderiza um RenderForm
 * (FormRendererPage.tsx, pages/v1/calendar/calendar-manager/GetAllPage.tsx)
 * para nao duplicar a regra em cada consumidor.
 */
export function isFormPublished(form: RenderForm | null): boolean {
  return form?.meta.status === 'active';
}

export function buildRenderSchema(rows: readonly ApiRow[]): RenderForm | null {
  const groups = buildConstructorSchemas(rows);
  if (groups.length === 0) return null;

  const head = rows.find((r) => str(r.fm_slug) !== undefined) ?? rows[0];
  const meta: RenderFormMeta = {
    slug: str(head?.fm_slug) ?? '',
    tableName: str(head?.fm_table_name),
    title: str(head?.fm_title) ?? str(head?.fm_slug) ?? 'Formulario',
    description: str(head?.fm_description),
    submitEndpoint: str(head?.fm_submit_endpoint),
    httpMethod: (str(head?.fm_http_method) ?? 'POST').toUpperCase(),
    status: str(head?.fm_status),
  };

  const schema: FormGridSchema = { rows: groups.flatMap((g) => g.schema.rows) };

  return { meta, schema };
}

/**
 * =============================================================================
 * BLOCO 6 — EXPORTAÇÕES
 * =============================================================================
 *
 * `export default buildConstructorSchemas` — o `default` é o AGRUPADOR (produto
 *   do construtor), enquanto `buildRenderSchema` sai por NOME (BLOCO 5).
 *
 * REGRA PRÁTICA: quem renderiza formulário publicado importa a função NOMEADA;
 *   quem monta as camadas do construtor pode usar o default. As demais funções
 *   deste arquivo são privadas de propósito (helpers de leitura e de campo).
 * -------------------------------------------------------------------------
 */
export default buildConstructorSchemas;
