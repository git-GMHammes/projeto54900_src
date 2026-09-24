/**
 * =========================================================================
 * FILE HEADER — utils/listConstructor.tsx
 * =========================================================================
 *
 * PROPOSITO: motor generico do "Construtor de Listas"
 * (list_manager/list_columns/list_actions — ver README_list_constructor.md).
 * Extraido de ListConstructorPage.tsx pra ser reaproveitado por qualquer
 * pagina que queira consumir uma listagem definida no banco em vez de
 * colunas fixas no codigo.
 *
 * O QUE FICA AQUI: tipos, normalizacao das linhas cruas da API (toManager/
 * toColumn/toAction), resolucao de celula (concat_json/fallback),
 * tratamento especial por coluna (list_columns.format ->
 * CUSTOM_CELL_RENDERERS) e avaliacao de business_rule_json. Tudo puro (sem
 * estado React) — cada pagina decide como buscar os dados e como reagir a
 * clique em acao (preview vs navegacao real), so o "o que renderizar" e
 * compartilhado.
 *
 * DEPENDENCIAS: utils/jsonList (parseStringList, usado pelo renderer
 * 'roles-badges'); components/ui/FormGrid/phone/mask (aplicarMascara, usado pelo
 * renderer 'phone').
 * CONSUMIDORES: pages/v1/list/ListBuilderPage.tsx (edita as definicoes),
 * pages/v1/list/ListConstructorPage.tsx (consumidor original, renderiza a
 * grid de verdade), pages/v1/form/FormBuilderPage.tsx e
 * pages/v1/form/formBuilder.model.ts (reaproveitam tipos/helpers) e
 * pages/v1/menu/GetPage.tsx.
 *
 * COMO REAPROVEITAR EM OUTRA TELA DE LISTAGEM: buscar o list_manager pelo
 * slug, normalizar as linhas com toManager/toColumn/toAction, montar cada
 * celula com renderCell(coluna, linha) e filtrar acoes visiveis com
 * evalBusinessRule(acao.businessRule, linha) antes de exibir o botao.
 * -------------------------------------------------------------------------
 */

import type { ReactNode } from 'react';

import { aplicarMascara } from '@/components/ui/FormGrid/phone/mask';

import { parseStringList } from './jsonList';

// -----------------------------------------------------------------------------
// Tipos + normalizacao das linhas cruas da API
// -----------------------------------------------------------------------------

export interface ListManagerRow {
  id: number;
  slug: string;
  title: string;
  description: string;
  apiGetEndpoint: string;
  apiSearchEndpoint: string;
  roles: string[];
  defaultSort: string;
  defaultOrder: 'asc' | 'desc';
  defaultLimit: number;
  limitOptions: number[];
  status: string;
}

export interface ListColumnRow {
  id: number;
  sortOrder: number;
  label: string;
  fieldKey: string;
  concat: ConcatPart[] | null;
  format: string;
  fallback: string;
  sortable: boolean;
  sortKey: string;
}

export interface ListActionRow {
  id: number;
  sortOrder: number;
  label: string;
  icon: string;
  actionType: 'link' | 'api_call' | 'modal';
  /** list_actions.data_action — identifica o handler de acoes 'modal' na pagina (ex.: 'reset-password'). */
  dataAction: string;
  hrefTemplate: string;
  apiEndpoint: string;
  httpMethod: string;
  confirm: boolean;
  confirmMessage: string;
  roles: string[];
  businessRule: BusinessRule | null;
}

/**
 * Parte 'icon': icone Bootstrap Icons na celula, com cor condicional —
 * `rule` (mesmo formato de business_rule_json) verdadeira -> `classTrue`,
 * falsa -> `classFalse`; sem `rule`, sempre `classTrue`. Nao entra no texto
 * da celula (cellValue), so no desenho (renderCell).
 */
export interface ConcatIconPart {
  type: 'icon';
  icon: string;
  rule?: BusinessRule | null;
  classTrue?: string;
  classFalse?: string;
  title?: string;
}

export type ConcatPart = { type: 'field'; key: string } | { type: 'literal'; value: string } | ConcatIconPart;
export interface BusinessRule {
  field: string;
  op: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';
  value: unknown;
}

/** Coerce seguro para string: aceita string/numero, qualquer outra coisa vira ''. */
export function str(v: unknown): string {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';
}

/** Coerce seguro para numero finito, com fallback se nao for numerico. */
export function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Colunas *_json chegam como string JSON (driver MySQLi) — tolera string/objeto/vazio. */
export function parseJson<T>(raw: unknown, fallback: T): T {
  if (raw === null || raw === undefined || raw === '') return fallback;
  if (typeof raw !== 'string') return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Normaliza uma linha crua de list_manager (snake_case da API) para ListManagerRow (camelCase, tipado). */
export function toManager(raw: Record<string, unknown>): ListManagerRow {
  return {
    id: num(raw.id),
    slug: str(raw.slug),
    title: str(raw.title) || str(raw.slug),
    description: str(raw.description),
    apiGetEndpoint: str(raw.api_get_endpoint),
    apiSearchEndpoint: str(raw.api_search_endpoint),
    roles: parseJson<string[]>(raw.roles, []),
    defaultSort: str(raw.default_sort) || 'id',
    defaultOrder: str(raw.default_order) === 'asc' ? 'asc' : 'desc',
    defaultLimit: num(raw.default_limit, 20),
    limitOptions: parseJson<number[]>(raw.limit_options_json, []),
    status: str(raw.status),
  };
}

/** Normaliza uma linha crua de list_columns para ListColumnRow. */
export function toColumn(raw: Record<string, unknown>): ListColumnRow {
  return {
    id: num(raw.id),
    sortOrder: num(raw.sort_order),
    label: str(raw.label),
    fieldKey: str(raw.field_key),
    concat: parseJson<ConcatPart[] | null>(raw.concat_json, null),
    format: str(raw.format) || 'text',
    fallback: raw.fallback === null || raw.fallback === undefined ? '—' : str(raw.fallback),
    sortable: raw.sortable === 1 || raw.sortable === '1' || raw.sortable === true,
    sortKey: str(raw.sort_key) || str(raw.field_key),
  };
}

/** Normaliza uma linha crua de list_actions para ListActionRow. */
export function toAction(raw: Record<string, unknown>): ListActionRow {
  return {
    id: num(raw.id),
    sortOrder: num(raw.sort_order),
    label: str(raw.label),
    icon: str(raw.icon),
    actionType: raw.action_type === 'api_call' ? 'api_call' : raw.action_type === 'modal' ? 'modal' : 'link',
    dataAction: str(raw.data_action),
    hrefTemplate: str(raw.href_template),
    apiEndpoint: str(raw.api_endpoint),
    httpMethod: str(raw.http_method) || 'GET',
    confirm: raw.confirm === 1 || raw.confirm === '1' || raw.confirm === true,
    confirmMessage: str(raw.confirm_message),
    roles: parseJson<string[]>(raw.roles, []),
    businessRule: parseJson<BusinessRule | null>(raw.business_rule_json, null),
  };
}

// -----------------------------------------------------------------------------
// Helpers de renderizacao dirigidos pela definicao (concat_json / business_rule_json)
// -----------------------------------------------------------------------------

/** Monta o texto de uma coluna "concat" juntando literais e campos da linha, na ordem definida em concat_json. */
export function resolveConcat(parts: ConcatPart[], row: Record<string, unknown>): string {
  return parts
    .map((part) =>
      part.type === 'literal' ? str(part.value) : part.type === 'field' ? str(row[part.key]) : '',
    )
    .join('');
}

/** Valor de exibicao de uma celula: usa concat_json se houver, senao o campo direto; cai no fallback da coluna se vazio. */
export function cellValue(column: ListColumnRow, row: Record<string, unknown>): string {
  const raw = column.concat ? resolveConcat(column.concat, row) : str(row[column.fieldKey]);
  return raw === '' ? column.fallback : raw;
}

/** Substitui {campo} no href_template/api_endpoint pelo valor real da linha (ex.: {id}, {slug}). */
export function resolveHrefTemplate(template: string, row: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => str(row[key]));
}

// -----------------------------------------------------------------------------
// Tratamento especial por coluna — opt-in via list_columns.format
// -----------------------------------------------------------------------------
//
// O dado que PEDE o tratamento especial vem do banco (list_columns.format);
// quem sabe DESENHAR aquele tratamento é este módulo. Sem entrada aqui para
// o `format` da coluna, cai no texto simples de sempre (cellValue). Novas
// páginas que consomem o motor herdam automaticamente qualquer format já
// cadastrado aqui.

const STATUS_BADGE_CLASS: Record<string, string> = {
  active: 'text-bg-success',
  draft: 'text-bg-secondary',
  inactive: 'text-bg-warning',
  blocked: 'text-bg-danger',
};

const CUSTOM_CELL_RENDERERS: Record<
  string,
  (value: string, column: ListColumnRow, row: Record<string, unknown>) => ReactNode
> = {
  // Espelha o <code>{r.slug}</code> do FormConstructorListPage.tsx original.
  code: (value) => <code>{value}</code>,
  // Espelha o badge colorido (STATUS_CLASS) do FormConstructorListPage.tsx original.
  'status-badge': (value) => (
    <span className={`badge ${STATUS_BADGE_CLASS[value] ?? 'text-bg-light'}`}>{value}</span>
  ),
  // Espelha o <RolesBadges> do menu/GetAllPage.tsx original (campo JSON de strings).
  'roles-badges': (value) => {
    const roles = parseStringList(value);
    if (roles.length === 0) return <span className="text-body-secondary">—</span>;
    return (
      <div className="d-flex flex-wrap gap-1">
        {roles.map((role) => (
          <span className="badge text-bg-light border" key={role}>
            {role}
          </span>
        ))}
      </div>
    );
  },
  // Ponto de quebra opcional (<wbr>) antes do '@': a coluna encolhe para
  // max(local, @dominio) sem alterar o texto copiado. Sem '@' (ex.: fallback) -> texto puro.
  'email-break': (value) => {
    const at = value.lastIndexOf('@');
    if (at <= 0) return value;
    return (
      <>
        {value.slice(0, at)}
        <wbr />
        {value.slice(at)}
      </>
    );
  },
  // Mesma mascara do campo de formulario (FormGrid/phone). So formata 10/11
  // digitos (DDD + numero); fora disso (DDI, fallback) devolve o valor cru.
  phone: (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10 && digits.length !== 11) return value;
    return <span className="text-nowrap">{aplicarMascara(digits)}</span>;
  },
};

/**
 * Deteccao automatica de format pelo field_key: coluna ainda em 'text' cujo
 * campo e reconhecido (ex.: *whatsapp*) ganha o tratamento sem precisar
 * setar list_columns.format. Format explicito no banco sempre prevalece.
 */
const AUTO_FORMAT_BY_FIELD_KEY: readonly { pattern: RegExp; format: string }[] = [
  { pattern: /whatsapp/i, format: 'phone' },
];

function effectiveFormat(column: ListColumnRow): string {
  if (column.format !== 'text') return column.format;
  return AUTO_FORMAT_BY_FIELD_KEY.find((a) => a.pattern.test(column.fieldKey))?.format ?? column.format;
}

/**
 * Renderiza uma celula da grid: usa o renderer customizado de
 * CUSTOM_CELL_RENDERERS quando column.format tem um cadastrado, senao
 * devolve o texto simples de cellValue().
 */
export function renderCell(column: ListColumnRow, row: Record<string, unknown>): ReactNode {
  const value = cellValue(column, row);
  const custom = CUSTOM_CELL_RENDERERS[effectiveFormat(column)];
  const body = custom ? custom(value, column, row) : value;

  // Partes 'icon' do concat_json: as que vem antes da 1a parte de texto
  // ficam a esquerda do conteudo, as demais a direita.
  const parts = Array.isArray(column.concat) ? column.concat : [];
  if (!parts.some(isIconPart)) return body;
  const firstText = parts.findIndex((p) => !isIconPart(p));
  const leading = parts.filter((p, i) => isIconPart(p) && (firstText === -1 || i < firstText));
  const trailing = parts.filter((p, i) => isIconPart(p) && firstText !== -1 && i > firstText);

  return (
    <span className="d-inline-flex align-items-center gap-1">
      {leading.map((p, i) => renderIconPart(p as ConcatIconPart, row, `l${i}`))}
      <span>{body}</span>
      {trailing.map((p, i) => renderIconPart(p as ConcatIconPart, row, `t${i}`))}
    </span>
  );
}

function isIconPart(part: ConcatPart): part is ConcatIconPart {
  return part.type === 'icon' && typeof part.icon === 'string' && part.icon !== '';
}

function renderIconPart(part: ConcatIconPart, row: Record<string, unknown>, key: string): ReactNode {
  const cls = evalBusinessRule(part.rule ?? null, row) ? part.classTrue : part.classFalse;
  return (
    <i
      key={key}
      className={`bi bi-${part.icon}${cls ? ` ${cls}` : ''}`}
      title={part.title || undefined}
      aria-hidden={part.title ? undefined : true}
    />
  );
}

/**
 * Todo `format` que o motor sabe desenhar de verdade hoje — `'text'` (sem
 * tratamento especial, o default) + toda chave cadastrada em
 * `CUSTOM_CELL_RENDERERS`. Fonte única para qualquer UI de escolha de
 * `format` (ex.: select do `ListBuilderPage`) — nunca desalinha do motor,
 * porque é derivada do mesmo objeto que `renderCell` consulta.
 */
export const KNOWN_CELL_FORMATS: readonly string[] = ['text', ...Object.keys(CUSTOM_CELL_RENDERERS)];

/** Coerce seguro para string usado so na comparacao de evalBusinessRule (nao lanca em tipos inesperados). */
function safeString(v: unknown): string {
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? String(v) : '';
}

/**
 * Avalia se uma acao deve ficar visivel para a linha, segundo a regra
 * gravada em list_actions.business_rule_json. Compara numericamente quando
 * os dois lados sao numeros validos e nao-vazios; senao compara como
 * string. Sem regra (rule === null), a acao e sempre visivel.
 */
export function evalBusinessRule(rule: BusinessRule | null, row: Record<string, unknown>): boolean {
  if (!rule) return true;
  const actual = row[rule.field];
  const expected = rule.value;
  const bothNumeric = !isNaN(Number(actual)) && !isNaN(Number(expected)) && actual !== '' && expected !== '';
  const a = bothNumeric ? Number(actual) : safeString(actual);
  const b = bothNumeric ? Number(expected) : safeString(expected);

  switch (rule.op) {
    case 'eq': return a === b;
    case 'ne': return a !== b;
    case 'lt': return a < b;
    case 'lte': return a <= b;
    case 'gt': return a > b;
    case 'gte': return a >= b;
    default: return true;
  }
}
