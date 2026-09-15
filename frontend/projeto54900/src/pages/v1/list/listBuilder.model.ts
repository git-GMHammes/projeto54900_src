// Modelo do ListBuilderPage — tipos, defaults e mappers estado -> payload.
// Espelha src/pages/v1/form/formBuilder.model.ts (mesmo padrão), mas para
// list_manager (1) -> list_columns (N) + list_actions (N) — duas coleções
// irmãs, sem aninhamento (diferente do form_manager -> form_groups ->
// form_rows -> form_fields). Introspecção de tabela/coluna (TabelaInfo/
// ColunaInfo/ColunasState/toTabela/toColuna) é genérica — reaproveitada
// direto de formBuilder.model.ts, não duplicada aqui.

export type {
  TabelaInfo,
  ColunaInfo,
  ColunasState,
} from '@/pages/v1/form/formBuilder.model';
export { toTabela, toColuna, tabelaDoEndpoint } from '@/pages/v1/form/formBuilder.model';
import { stripVazios, bit } from '@/pages/v1/form/formBuilder.model';
import type { Payload } from '@/pages/v1/form/formBuilder.model';
import type { ColunaInfo } from '@/pages/v1/form/formBuilder.model';

// ─── list_manager (1 por tabela escolhida) ──────────────────────────────────

export type ManagerStatus = 'draft' | 'active' | 'inactive';

export interface ManagerLocal {
  /** PK de `list_manager` depois do primeiro Salvar. `null` = ainda não persistido. */
  dbId: number | null;
  slug: string;
  /** Tabela/view real de origem (schema) — fonte de verdade pra "Colunas (auto)". */
  tableName: string;
  title: string;
  description: string;
  apiGetEndpoint: string;
  apiSearchEndpoint: string;
  /** Lista JSON de slugs de user_roles — ver utils/jsonList. */
  roles: string;
  defaultSort: string;
  defaultOrder: 'asc' | 'desc';
  defaultLimit: number;
  /** JSON cru (estático) — ex.: "[10,20,50,100]". */
  limitOptionsJson: string;
  status: ManagerStatus;
  version: number;
  /** Só UI: enquanto true, o slug acompanha o título. */
  slugAuto: boolean;
}

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

// ─── list_columns (N por manager) ───────────────────────────────────────────

export interface ColumnLocal {
  /** Chave estável de UI (uuid) — key do React. */
  id: string;
  /** PK de `list_columns` depois do Salvar. `null` = ainda não persistido. */
  dbId: number | null;
  sortOrder: number;
  label: string;
  fieldKey: string;
  /** JSON cru (estático) — partes {type:'field'|'literal', ...}. */
  concatJson: string;
  format: string;
  cellClass: string;
  fallback: string;
  sortable: boolean;
  sortKey: string;
  /** JSON cru (estático) — ordenação composta. */
  sortConcatJson: string;
  visible: boolean;
}

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

// ─── list_actions (N por manager) ───────────────────────────────────────────

export type ActionType = 'link' | 'api_call';

export interface ActionLocal {
  /** Chave estável de UI (uuid) — key do React. */
  id: string;
  /** PK de `list_actions` depois do Salvar. `null` = ainda não persistido. */
  dbId: number | null;
  sortOrder: number;
  label: string;
  icon: string;
  actionType: ActionType;
  hrefTemplate: string;
  apiEndpoint: string;
  httpMethod: string;
  dataAction: string;
  target: string;
  confirm: boolean;
  confirmMessage: string;
  /** JSON cru (estático) — [{name,key,fallback}]. */
  extraDataJson: string;
  /** Lista JSON de slugs de user_roles. */
  roles: string;
  /** JSON cru (estático) — {field,op,value}. */
  businessRuleJson: string;
}

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

// ─── Distribuição de colunas — "Colunas (auto)" no modal do manager ────────
// Mesmo padrão de adicionarColunas/removerColuna do form builder: cada coluna
// real da tabela some do listbox assim que vira um list_columns.fieldKey.

export function colunasJaUsadas(colunas: ColumnLocal[]): string[] {
  return colunas.map((c) => c.fieldKey).filter((k) => k !== '');
}

// ─── Mappers estado → payload da API (create / update) ─────────────────────
// Cada camada envia só o que está preenchido (permit_empty na API); booleanos
// viram 0/1; a FK do pai entra sempre explícita. JSON cru é enviado como
// string — o Processor decodifica se vier objeto, mas string JSON já pronta
// também é aceita (ver Services/V1/List/*/Processor.php).

/** `ManagerLocal` → corpo de `list-manager/create|update`. */
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

/** `ColumnLocal` → corpo de `list-columns/create|update` (FK `list_manager_id`). */
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

/** `ActionLocal` → corpo de `list-actions/create|update` (FK `list_manager_id`). */
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

// ─── Hidratação: linha crua da API → estado do builder (modo edição) ───────
// Inverso dos *Payload(). Diferente do form (que precisa da view achatada
// pra reconstruir 4 níveis), aqui list_columns/list_actions já são
// consultáveis direto por list_manager_id — GET list-manager/get/{id} +
// list-columns/find + list-actions/find bastam, sem view.

function str(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function bitFromRow(v: unknown): boolean {
  return v === 1 || v === '1' || v === true;
}

/** Linha crua de `GET list-manager/get/{id}` → `ManagerLocal` já com `dbId`. */
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

/** Linha crua de `list-columns/find` → `ColumnLocal` já com `dbId`. */
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

/** Linha crua de `list-actions/find` → `ActionLocal` já com `dbId`. */
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
