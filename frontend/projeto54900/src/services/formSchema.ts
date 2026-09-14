// Adapter: linhas achatadas da view view_form_manager -> FormGridSchema por grupo.
//
// A view devolve 1 linha por campo, com prefixos:
//   fm_ = form_manager   fg_ = form_groups   fr_ = form_rows   fc_ = form_fields
//
// buildConstructorSchemas() agrupa por fg_slug, ordena por sort_order e converte
// cada coluna fc_* na prop equivalente do AnyFieldSchema do FormGrid. Colunas
// *_json chegam como string (driver MySQLi) ou ja como objeto — ambos tratados.

import type { AnyFieldSchema, FormGridSchema } from '@/components/ui/FormGrid/Input';
import type { ApiRow } from '@/types/api';

export interface ConstructorGroup {
  slug: string;
  title: string;
  sortOrder: number;
  schema: FormGridSchema;
}

// --- helpers de leitura ------------------------------------------------------

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
  // FormGrid nao tem slot de ajuda: help_text vira tooltip (title).
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
      if (typeof rec.labelTemplate === 'string') set('labelTemplate', rec.labelTemplate);
      if (Array.isArray(rec.labelKey) || typeof rec.labelKey === 'string') {
        set('labelKey', rec.labelKey);
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
  } else if (type === 'data') {
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

export interface RenderFormMeta {
  slug: string;
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

export function buildRenderSchema(rows: readonly ApiRow[]): RenderForm | null {
  const groups = buildConstructorSchemas(rows);
  if (groups.length === 0) return null;

  const head = rows.find((r) => str(r.fm_slug) !== undefined) ?? rows[0];
  const meta: RenderFormMeta = {
    slug: str(head?.fm_slug) ?? '',
    title: str(head?.fm_title) ?? str(head?.fm_slug) ?? 'Formulario',
    description: str(head?.fm_description),
    submitEndpoint: str(head?.fm_submit_endpoint),
    httpMethod: (str(head?.fm_http_method) ?? 'POST').toUpperCase(),
    status: str(head?.fm_status),
  };

  const schema: FormGridSchema = { rows: groups.flatMap((g) => g.schema.rows) };

  return { meta, schema };
}

export default buildConstructorSchemas;
