/**
 * =============================================================================
 * FILE HEADER — listBuilder.model (modelo do construtor de LISTAS)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Concentra a FORMA dos dados do construtor de listas (`/v1/list-constructor`):
 *   tipos de estado de UI (`*Local`), construtores `*Inicial()`, tradutores
 *   estado -> corpo da API (`*Payload()`) e o tradutor reverso (`*FromRow()`).
 *   A página (`ListBuilderPage.tsx`) fica só com estado React, schema de tela e
 *   modais — nenhuma regra de forma de dado mora lá.
 *
 *   FORMA DA ÁRVORE (diferença estrutural em relação ao construtor de
 *   formulários): aqui NÃO há aninhamento. `list_manager` é a raiz e
 *   `list_columns` + `list_actions` são DUAS COLEÇÕES IRMÃS, ambas filhas do
 *   manager (no form são 4 níveis em cadeia).
 *     list_manager (1 por tabela/view escolhida)
 *       +-- list_columns (N)
 *       +-- list_actions (N)
 *
 * DEPENDÊNCIAS (o que este arquivo consome):
 *   - `@/pages/v1/form/formBuilder.model` — a parte GENÉRICA da introspecção é
 *     REAPROVEITADA daqui: reexporta `TabelaInfo`/`ColunaInfo`/`ColunasState` e
 *     `toTabela`/`toColuna`/`tabelaDoEndpoint`, além de importar `stripVazios`,
 *     `bit` e o tipo `Payload`. Consequência: o módulo `list` depende do módulo
 *     `form` nas peças comuns — mexer naquelas funções afeta este arquivo.
 *   - `crypto.randomUUID()` (nativo, sem import) — chaves de UI (`id`) de coluna
 *     e ação.
 *   - `@/utils/jsonList` é usado pelo CONSUMIDOR, não aqui: `roles` é guardado
 *     como string JSON (o formato do banco) e quem edita é o `<FormGrid>`.
 *
 * CONSUMIDORES:
 *   - `src/pages/v1/list/ListBuilderPage.tsx` — usa tudo: `*Local`, `*Inicial()`,
 *     `*Payload()`, `*FromRow()` e `colunasJaUsadas`.
 *   - `src/pages/v1/list/ListConstructorPage.tsx` NÃO usa este arquivo: o preview
 *     consome o motor `@/utils/listConstructor` (tipos próprios `ListManagerRow`/
 *     `ListColumnRow`/`ListActionRow`). São DOIS conjuntos de tipos para o mesmo
 *     dado — builder (estado editável) x preview (leitura).
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. Todo campo de `*Local` aparece em 4 lugares, na mesma ordem: tipo ->
 *      `*Inicial()` -> `*Payload()` (escrita) -> `*FromRow()` (leitura). Esquecer
 *      um deles é a causa mais comum de "campo que salva mas não volta".
 *   2. `dbId` = PK no banco (`null` = não persistido); `id` = uuid de UI (key do
 *      React). Nunca use `dbId` como chave de React.
 *   3. Colunas `*_json` são STRING (JSON cru, editado como texto): este arquivo
 *      apenas transporta; quem interpreta é o consumidor.
 *   4. A hidratação NÃO precisa de view: `list-manager/get/{id}` +
 *      `list-columns/find` + `list-actions/find` bastam (diferente do form, que
 *      reconstrói 4 níveis a partir da view achatada).
 * =============================================================================
 */

/**
 * =============================================================================
 * BLOCO 1 — PEÇAS GENÉRICAS REAPROVEITADAS DO CONSTRUTOR DE FORMULÁRIOS
 * =============================================================================
 *
 * O QUE FAZ: em vez de duplicar a introspecção de tabela/coluna e as utilidades
 *   de payload, este arquivo REEXPORTA/importa de
 *   `@/pages/v1/form/formBuilder.model`:
 *     reexportados (o consumidor importa daqui; a implementação é de lá):
 *       tipos   `TabelaInfo`, `ColunaInfo`, `ColunasState`
 *       funções `toTabela`, `toColuna`, `tabelaDoEndpoint`
 *     importados para uso interno:
 *       `stripVazios`, `bit` (payload) e o tipo `Payload`
 *
 * POR QUE ISSO IMPORTA: evolução na introspecção ou nas regras de payload do form
 *   reflete aqui automaticamente — e uma quebra lá também. Ao mudar a assinatura
 *   de uma dessas funções, procure consumidores nos DOIS módulos.
 *
 * NOTA: este é o ÚNICO ponto do módulo `list` que depende de `pages/v1/form` — e
 *   a direção da dependência é esta (list -> form), não o contrário.
 * =============================================================================
 */

export type {
  TabelaInfo,
  ColunaInfo,
  ColunasState,
} from '@/pages/v1/form/formBuilder.model';
export { toTabela, toColuna, tabelaDoEndpoint } from '@/pages/v1/form/formBuilder.model';
import { stripVazios, bit } from '@/pages/v1/form/formBuilder.model';
import type { Payload } from '@/pages/v1/form/formBuilder.model';
import type { ColunaInfo } from '@/pages/v1/form/formBuilder.model';

/**
 * =============================================================================
 * BLOCO 2 — list_manager (1 registro por tabela/view escolhida; a RAIZ)
 * =============================================================================
 *
 * O QUE FAZ: `ManagerLocal` é o estado de UI da raiz — os metadados da listagem
 *   (slug, título, endpoints, ordenação/limite padrão) ligados a UMA tabela ou
 *   view real do banco. `managerInicial()` cria esse estado vazio.
 *
 * MAPA — `ManagerLocal` -> coluna de `list_manager`:
 *   dbId              -> `id` (PK; `null` = ainda não salvo -> INSERT)
 *   slug              -> `slug` (identidade da listagem na URL/preview)
 *   tableName         -> `table_name` (tabela/view de origem; habilita
 *                       "Colunas (auto)" no modal)
 *   title             -> `title`
 *   description       -> `description`
 *   apiGetEndpoint    -> `api_get_endpoint` (endpoint que LISTA os dados)
 *   apiSearchEndpoint -> `api_search_endpoint` (busca)
 *   roles             -> `roles` (lista JSON de slugs de user_roles)
 *   defaultSort       -> `default_sort` (default `id`)
 *   defaultOrder      -> `default_order` (`asc`|`desc`; default `desc`)
 *   defaultLimit      -> `default_limit` (default 20)
 *   limitOptionsJson  -> `limit_options_json` (JSON cru, ex.: `[10,20,50,100]`)
 *   status            -> `status` (enum `ManagerStatus`)
 *   version           -> `version`
 *   slugAuto          -> SÓ UI (enquanto `true`, o slug acompanha o título)
 *
 * CONSUMIDORES: `ListBuilderPage.tsx` (schema do modal do manager +
 *   `managerPayload`) e `managerFromRow()` (BLOCO 7), no modo edição.
 *
 * COMO REAPROVEITAR: o mesmo trio do construtor de formulários — `interface
 *   XLocal` (`dbId` primeiro) -> `xInicial()` -> `xPayload()` — mais o quarto membro
 *   do par de leitura: `xFromRow()`.
 * -------------------------------------------------------------------------
 */

/**
 * Status da listagem, espelhando o enum `status` de `list_manager`.
 * `draft` = em montagem; `active` = em uso; `inactive` = fora do ar sem apagar.
 */
export type ManagerStatus = 'draft' | 'active' | 'inactive';

/**
 * Estado de UI do nó raiz (1:1 com a tabela/view escolhida).
 * `dbId: number | null` primeiro é o que permite o MESMO `managerPayload()`
 * servir para criar e para atualizar; `slugAuto` é o único campo "só UI".
 */
export interface ManagerLocal {
  /** PK de `list_manager` depois do primeiro Salvar. `null` = ainda não persistido. */
  dbId: number | null;
  slug: string;
  /** Tabela/view real de origem (schema) — fonte de verdade pra "Colunas (auto)". */
  tableName: string;
  title: string;
  description: string;
  /** Endpoint que lista os dados — é ele que o preview/renderizador chama. */
  apiGetEndpoint: string;
  /** Endpoint de busca da listagem. */
  apiSearchEndpoint: string;
  /** Lista JSON de slugs de user_roles — ver utils/jsonList. */
  roles: string;
  /** Coluna de ordenação padrão (default `id`). */
  defaultSort: string;
  /** Direção padrão da ordenação. */
  defaultOrder: 'asc' | 'desc';
  /** Registros por página por padrão. */
  defaultLimit: number;
  /** JSON cru (estático) — ex.: "[10,20,50,100]". */
  limitOptionsJson: string;
  status: ManagerStatus;
  version: number;
  /** Só UI: enquanto true, o slug acompanha o título. */
  slugAuto: boolean;
}

/**
 * Estado inicial da raiz: nenhum campo preenchido, `dbId: null` e os defaults do
 * banco (`defaultSort: 'id'`, `defaultOrder: 'desc'`, `defaultLimit: 20`,
 * `limitOptionsJson: '[10,20,50,100]'`, `status: 'draft'`, `version: 1`).
 * @param tableName tabela/view real escolhida na tela (entra já no estado)
 * @returns `ManagerLocal` vazio — como `dbId` nasce `null`, o mesmo
 *          `managerPayload()` decide entre POST e UPDATE
 */
export function managerInicial(tableName = ''): ManagerLocal {
  return {
    dbId: null,
    slug: '',
    tableName,
    title: '',
    description: '',
    apiGetEndpoint: '',
    apiSearchEndpoint: '',
    roles: '',
    defaultSort: 'id',
    defaultOrder: 'desc',
    defaultLimit: 20,
    limitOptionsJson: '[10,20,50,100]',
    status: 'draft',
    version: 1,
    slugAuto: true,
  };
}

/**
 * =============================================================================
 * BLOCO 3 — list_columns (N por manager) — o que a grade MOSTRA
 * =============================================================================
 *
 * O QUE FAZ: `ColumnLocal` descreve UMA coluna da listagem — qual campo exibir,
 *   como montá-lo (`concatJson`), como desenhá-lo (`format`/`cellClass`), como
 *   ordenar (`sortable`/`sortKey`/`sortConcatJson`) e o que exibir quando vazio
 *   (`fallback`).
 *
 * RELAÇÃO COM O MOTOR DE LISTAGEM (para não duplicar conceito): o `format`
 *   gravado aqui é o MESMO que o motor usa para escolher o renderer da célula
 *   (`CUSTOM_CELL_RENDERERS` em `@/utils/listConstructor`) e `concatJson` é o
 *   `concat_json` que `cellValue()` resolve. Ao criar um `format` novo, os dois
 *   lados precisam existir: aqui ele só é TRANSPORTADO; lá ele é IMPLEMENTADO.
 *
 * DEFAULTS DE `columnInicial(coluna, sortOrder)`: vem pré-preenchido pela metadata
 *   da coluna real (`label`/`fieldKey`/`sortKey` = nome da coluna), `format:
 *   'text'`, `fallback: '—'`, `visible: true`, `sortable: false`.
 *
 * CAMPOS "CRUS" (string JSON): `concatJson` e `sortConcatJson` são digitados como
 *   texto — não há editor estruturado (mesma decisão do modelo do form para
 *   `options_json`/`datalist_json`).
 *
 * CONSUMIDORES: `ListBuilderPage.tsx` (`columnSchema` + `columnPayload`) e
 *   `columnFromRow()` (BLOCO 7).
 * -------------------------------------------------------------------------
 */

/**
 * Estado de UI de UMA coluna da listagem (filha da raiz).
 * `id` é a chave de UI (uuid), `dbId` é a PK em `list_columns` — o mesmo padrão
 * de todos os níveis do construtor.
 */
export interface ColumnLocal {
  /** Chave estável de UI (uuid) — key do React. */
  id: string;
  /** PK de `list_columns` depois do Salvar. `null` = ainda não persistido. */
  dbId: number | null;
  /** Ordem da coluna na grade. */
  sortOrder: number;
  /** Rótulo do cabeçalho da coluna. */
  label: string;
  /** Campo do registro exibido quando NÃO há `concatJson`. */
  fieldKey: string;
  /** JSON cru (estático) — partes {type:'field'|'literal', ...}. */
  concatJson: string;
  /** Formato da célula — precisa existir em `KNOWN_CELL_FORMATS` (motor). */
  format: string;
  /** Classes CSS da célula (alinhamento, cores...). */
  cellClass: string;
  /** Valor exibido quando o campo vem vazio (default '—'). */
  fallback: string;
  /** Liga/desliga a ordenação por esta coluna no cabeçalho. */
  sortable: boolean;
  /** Chave enviada para a API quando a coluna é ordenada. */
  sortKey: string;
  /** JSON cru (estático) — ordenação composta. */
  sortConcatJson: string;
  /** Coluna visível na grade. */
  visible: boolean;
}

/**
 * Estado inicial de uma coluna da grade.
 * @param coluna     metadata opcional da coluna real (pré-preenche
 *                   `label`/`fieldKey`/`sortKey` com o nome da coluna)
 * @param sortOrder  posição inicial da coluna
 * @returns `ColumnLocal` com `dbId: null`, `format: 'text'`, `fallback: '—'`,
 *          `visible: true`, `sortable: false` e `id` uuid NOVO a cada chamada
 */
export function columnInicial(coluna?: ColunaInfo, sortOrder = 0): ColumnLocal {
  return {
    id: crypto.randomUUID(),
    dbId: null,
    sortOrder,
    label: coluna?.name ?? '',
    fieldKey: coluna?.name ?? '',
    concatJson: '',
    format: 'text',
    cellClass: '',
    fallback: '—',
    sortable: false,
    sortKey: coluna?.name ?? '',
    sortConcatJson: '',
    visible: true,
  };
}

/**
 * =============================================================================
 * BLOCO 4 — list_actions (N por manager) — o que a linha PODE FAZER
 * =============================================================================
 *
 * O QUE FAZ: `ActionLocal` descreve UMA ação da listagem — o rótulo/ícone, o
 *   tipo (`link` navega, `api_call` chama a API), o template de destino, o
 *   verbo, as flags de confirmação e a REGRA DE NEGÓCIO que decide se a ação
 *   fica habilitada para cada registro.
 *
 * RELAÇÃO COM O MOTOR (mesmo dado, dois consumidores):
 *   - `utils/listConstructor.tsx` transforma a linha do banco em `ListActionRow`
 *     e é quem EXECUTA a ação (no `FormConstructorListPage`);
 *   - aqui a ação é o estado EDITÁVEL do construtor (o `ListBuilderPage` grava).
 *   `businessRuleJson` é o `{field,op,value}` que `evalBusinessRule()` avalia; e
 *   `hrefTemplate`/`apiEndpoint` aceitam `{campo}` (substituído por
 *   `resolveHrefTemplate` na hora de usar).
 *
 * DEFAULTS DE `actionInicial(sortOrder)`: vazio e `actionType: 'link'`,
 *   `httpMethod: 'GET'` (o verbo só importa no tipo `api_call`), `confirm: false`.
 *
 * CONSUMIDORES: `ListBuilderPage.tsx` (`actionSchema` + `actionPayload`) e
 *   `actionFromRow()` (BLOCO 7).
 * -------------------------------------------------------------------------
 */

/** Tipo da ação: `link` = navegação (rota do app); `api_call` = chamada HTTP. */
export type ActionType = 'link' | 'api_call';

/**
 * Estado de UI de UMA ação da listagem (filha da raiz, irmã das colunas).
 * `id` = chave de UI (uuid); `dbId` = PK em `list_actions`.
 */
export interface ActionLocal {
  /** Chave estável de UI (uuid) — key do React. */
  id: string;
  /** PK de `list_actions` depois do Salvar. `null` = ainda não persistido. */
  dbId: number | null;
  /** Ordem da ação na coluna "Ações" da linha. */
  sortOrder: number;
  /** Texto do botão. */
  label: string;
  /** Nome do ícone Bootstrap (`bi-*`), quando a UI quiser desenhar. */
  icon: string;
  /** Ver `ActionType`. */
  actionType: ActionType;
  /** Rota do app com `{campo}` (usada só quando `actionType = 'link'`). */
  hrefTemplate: string;
  /** Endpoint da API com `{campo}` (usado só quando `actionType = 'api_call'`). */
  apiEndpoint: string;
  /** Verbo HTTP da ação `api_call` (default `GET`). */
  httpMethod: string;
  /** Atributo/comando de dados extra repassado à UI. */
  dataAction: string;
  /** Alvo de navegação (ex.: `_blank`). */
  target: string;
  /** Pede confirmação antes de executar. */
  confirm: boolean;
  /** Texto do `confirm`; vazio = mensagem padrão do consumidor. */
  confirmMessage: string;
  /** JSON cru (estático) — [{name,key,fallback}]. */
  extraDataJson: string;
  /** Lista JSON de slugs de user_roles. */
  roles: string;
  /** JSON cru (estático) — {field,op,value}. */
  businessRuleJson: string;
}

/**
 * Estado inicial de uma ação: tudo vazio, `actionType: 'link'`,
 * `httpMethod: 'GET'`, `confirm: false` e `id` uuid NOVO a cada chamada.
 * @param sortOrder posição inicial da ação na listagem
 */
export function actionInicial(sortOrder = 0): ActionLocal {
  return {
    id: crypto.randomUUID(),
    dbId: null,
    sortOrder,
    label: '',
    icon: '',
    actionType: 'link',
    hrefTemplate: '',
    apiEndpoint: '',
    httpMethod: 'GET',
    dataAction: '',
    target: '',
    confirm: false,
    confirmMessage: '',
    extraDataJson: '',
    roles: '',
    businessRuleJson: '',
  };
}

/**
 * =============================================================================
 * BLOCO 5 — DISTRIBUIÇÃO DE COLUNAS ("Colunas (auto)" no modal do manager)
 * =============================================================================
 *
 * O QUE FAZ: devolve os `fieldKey` já usados por alguma `ColumnLocal` — a lista
 *   que o multiselect "Colunas (auto)" usa para NÃO oferecer de novo uma coluna
 *   que já virou coluna da grade.
 *
 * MESMO PADRÃO DO FORM: no construtor de formulários a regra equivalente é
 *   `adicionarColunas`/`removerColuna` (com teto de 12 por linha). Aqui não há
 *   teto nem par de funções: a seleção é uma lista de nomes de coluna, e quem
 *   acrescenta/remove é o handler da página.
 *
 * CONSUMIDOR: `ListBuilderPage.tsx`, ao abrir o modal do manager (para montar a
 *   prop `disabledValues` do select de colunas).
 * @param colunas colunas já gravadas/editadas no estado
 * @returns lista de `fieldKey` não vazios (duplicatas NÃO são removidas aqui —
 *          é responsabilidade de quem grava)
 * =============================================================================
 */
export function colunasJaUsadas(colunas: ColumnLocal[]): string[] {
  return colunas.map((c) => c.fieldKey).filter((k) => k !== '');
}

/**
 * =============================================================================
 * BLOCO 6 — MAPPERS ESTADO -> PAYLOAD (ESCRITA: create / update)
 * =============================================================================
 *
 * O QUE FAZ: converte cada `*Local` no corpo JSON de
 *   `list-manager|list-columns|list-actions / create|update`.
 *
 * REGRAS DO CONTRATO (as mesmas do construtor de formulários, via `stripVazios`):
 *   - só vai o que está PREENCHIDO: `''`/`null`/`undefined` são omitidos (a API é
 *     `permit_empty`, então omitir = manter o default do banco);
 *   - booleano NUNCA vai cru: sempre `bit()` -> 0/1 (TINYINT); sem `bit()`, o
 *     `stripVazios` DESCARTA a chave (nem `true` passa);
 *   - a FK do pai (`list_manager_id`) entra SEMPRE explícita, como segundo
 *     argumento de `columnPayload`/`actionPayload` — é o que amarra coluna/ação
 *     ao manager;
 *   - JSON (`concat_json`, `limit_options_json`, `business_rule_json`...) é enviado
 *     como STRING: o Processor do backend aceita string pronta ou objeto — aqui
 *     mantemos string para não reinterpretar o que o usuário digitou;
 *   - `id`, timestamps e auditoria são do BACKEND.
 *
 * CONSUMIDORES: `ListBuilderPage.tsx` (`salvarManager`/`salvarColuna`/
 *   `salvarAcao`). O INVERSO é o BLOCO 7.
 * -------------------------------------------------------------------------
 */

/**
 * `ManagerLocal` -> corpo de `list-manager/create|update`.
 * @param m estado da raiz (BLOCO 2)
 * @returns corpo sem chaves vazias; `slugAuto` (só UI) NÃO é enviado e `version`
 *          cai para 1 quando inválido
 */
export function managerPayload(m: ManagerLocal): Payload {
  return stripVazios({
    slug: m.slug,
    table_name: m.tableName,
    title: m.title,
    description: m.description,
    api_get_endpoint: m.apiGetEndpoint,
    api_search_endpoint: m.apiSearchEndpoint,
    roles: m.roles,
    default_sort: m.defaultSort,
    default_order: m.defaultOrder,
    default_limit: m.defaultLimit,
    limit_options_json: m.limitOptionsJson,
    status: m.status,
    version: Number.isFinite(m.version) ? m.version : 1,
  });
}

/**
 * `ColumnLocal` -> corpo de `list-columns/create|update`.
 * @param c estado da coluna (BLOCO 3)
 * @param listManagerId `dbId` do manager dono — a FK que liga a coluna à raiz
 * @returns corpo com a FK explícita, `sortable`/`visible` convertidos por `bit()`
 *          e os JSON (`concat_json`/`sort_concat_json`) como string
 */
export function columnPayload(c: ColumnLocal, listManagerId: number): Payload {
  return stripVazios({
    list_manager_id: listManagerId,
    sort_order: c.sortOrder,
    label: c.label,
    field_key: c.fieldKey,
    concat_json: c.concatJson,
    format: c.format,
    cell_class: c.cellClass,
    fallback: c.fallback,
    sortable: bit(c.sortable),
    sort_key: c.sortKey,
    sort_concat_json: c.sortConcatJson,
    visible: bit(c.visible),
  });
}

/**
 * `ActionLocal` -> corpo de `list-actions/create|update`.
 * @param a estado da ação (BLOCO 4)
 * @param listManagerId `dbId` do manager dono — a FK que liga a ação à raiz
 * @returns corpo com `confirm` via `bit()` e os JSON (`extra_data_json`,
 *          `business_rule_json`) como string
 */
export function actionPayload(a: ActionLocal, listManagerId: number): Payload {
  return stripVazios({
    list_manager_id: listManagerId,
    sort_order: a.sortOrder,
    label: a.label,
    icon: a.icon,
    action_type: a.actionType,
    href_template: a.hrefTemplate,
    api_endpoint: a.apiEndpoint,
    http_method: a.httpMethod,
    data_action: a.dataAction,
    target: a.target,
    confirm: bit(a.confirm),
    confirm_message: a.confirmMessage,
    extra_data_json: a.extraDataJson,
    roles: a.roles,
    business_rule_json: a.businessRuleJson,
  });
}

/**
 * =============================================================================
 * BLOCO 7 — HIDRATAÇÃO: linha crua da API -> estado do builder (LEITURA)
 * =============================================================================
 *
 * O QUE FAZ: é o INVERSO dos `*Payload()` (BLOCO 6) — reconstrói o estado de UI
 *   a partir das linhas que a API devolve, no modo edição
 *   (`/v1/list-constructor/update/:id`).
 *
 * DIFERENÇA EM RELAÇÃO AO FORM: aqui NÃO existe view achatada. Como as duas
 *   coleções filhas são irmãs e apontam direto para o manager, bastam 3
 *   chamadas: `list-manager/get/{id}` (raiz), `list-columns/find` e
 *   `list-actions/find` filtrados por `list_manager_id`. No construtor de
 *   formulários isso exigiria a `view_form_manager` (4 níveis achatados).
 *
 * O QUE NÃO VOLTA DA API: as chaves de UI (`id` uuid) — são geradas aqui
 *   (`crypto.randomUUID()`), uma por nó, a cada hidratação. O `dbId` vem da
 *   linha e é ele que faz o próximo Salvar ser UPDATE.
 *
 * POR QUE OS TRÊS COERCEDORES: a linha crua é `Record<string, unknown>` (o
 *   driver pode mandar número onde a UI usa string, `1`/`'1'` onde é booleano, e
 *   JSON como string). Converter inline, em cada campo, espalharia essa
 *   tolerância pelo arquivo — concentrada aqui, ela tem um lugar só para mudar.
 * =============================================================================
 */

/**
 * Valor cru -> string do estado (número vira texto; resto vira `''`).
 * Usado em TODOS os campos de texto, inclusive INT (a UI mantém tudo string).
 */
function str(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

/**
 * Valor cru -> número, com `fallback` quando não é numérico (`''`, texto, nulo).
 * @param v valor cru
 * @param fallback valor devolvido quando não dá para converter (default 0)
 */
function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Valor cru de flag (TINYINT) -> booleano. Aceita `1`, `'1'` e `true`; qualquer
 * outro valor (inclusive `0` e `'0'`) é `false`. É o inverso de `bit()`.
 */
function bitFromRow(v: unknown): boolean {
  return v === 1 || v === '1' || v === true;
}

/**
 * Linha crua de `GET list-manager/get/{id}` -> `ManagerLocal` já com `dbId`.
 * @param raw registro da raiz vindo da API
 * @returns estado da raiz para o modo edição; `slugAuto` volta SEMPRE `false`
 *          (o slug já foi decidido na criação), `status` fora do enum cai em
 *          `draft`, `default_sort`/`limit_options_json` ganham fallback
 * Vai junto com `columnFromRow`/`actionFromRow`: os três montam o estado que o
 *   `ListBuilderPage` distribui nos `useState` do modo edição.
 */
export function managerFromRow(raw: Record<string, unknown>): ManagerLocal {
  const statusRaw = str(raw.status);
  const status: ManagerStatus = (['draft', 'active', 'inactive'] as const).includes(
    statusRaw as ManagerStatus,
  )
    ? (statusRaw as ManagerStatus)
    : 'draft';

  return {
    dbId: num(raw.id) || null,
    slug: str(raw.slug),
    tableName: str(raw.table_name),
    title: str(raw.title),
    description: str(raw.description),
    apiGetEndpoint: str(raw.api_get_endpoint),
    apiSearchEndpoint: str(raw.api_search_endpoint),
    roles: str(raw.roles),
    defaultSort: str(raw.default_sort) || 'id',
    defaultOrder: str(raw.default_order) === 'asc' ? 'asc' : 'desc',
    defaultLimit: num(raw.default_limit, 20),
    limitOptionsJson: str(raw.limit_options_json) || '[10,20,50,100]',
    status,
    version: num(raw.version, 1),
    // Editando um registro existente: título e slug não devem mais andar
    // juntos (o slug já foi decidido na criação).
    slugAuto: false,
  };
}

/**
 * Linha crua de `list-columns/find` -> `ColumnLocal` já com `dbId`.
 * @param raw registro de `list_columns` vindo da API
 * @returns coluna hidratada (chave de UI NOVA); `format` vazio cai em `'text'`
 */
export function columnFromRow(raw: Record<string, unknown>): ColumnLocal {
  return {
    id: crypto.randomUUID(),
    dbId: num(raw.id) || null,
    sortOrder: num(raw.sort_order),
    label: str(raw.label),
    fieldKey: str(raw.field_key),
    concatJson: str(raw.concat_json),
    format: str(raw.format) || 'text',
    cellClass: str(raw.cell_class),
    fallback: str(raw.fallback),
    sortable: bitFromRow(raw.sortable),
    sortKey: str(raw.sort_key),
    sortConcatJson: str(raw.sort_concat_json),
    visible: bitFromRow(raw.visible),
  };
}

/**
 * Linha crua de `list-actions/find` -> `ActionLocal` já com `dbId`.
 * @param raw registro de `list_actions` vindo da API
 * @returns ação hidratada (chave de UI NOVA); `action_type` diferente de
 *          `api_call` cai em `'link'` e `http_method` vazio cai em `'GET'`
 */
export function actionFromRow(raw: Record<string, unknown>): ActionLocal {
  return {
    id: crypto.randomUUID(),
    dbId: num(raw.id) || null,
    sortOrder: num(raw.sort_order),
    label: str(raw.label),
    icon: str(raw.icon),
    actionType: raw.action_type === 'api_call' ? 'api_call' : 'link',
    hrefTemplate: str(raw.href_template),
    apiEndpoint: str(raw.api_endpoint),
    httpMethod: str(raw.http_method) || 'GET',
    dataAction: str(raw.data_action),
    target: str(raw.target),
    confirm: bitFromRow(raw.confirm),
    confirmMessage: str(raw.confirm_message),
    extraDataJson: str(raw.extra_data_json),
    roles: str(raw.roles),
    businessRuleJson: str(raw.business_rule_json),
  };
}
