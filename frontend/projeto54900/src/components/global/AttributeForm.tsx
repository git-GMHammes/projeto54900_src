// Componente global reutilizavel: FORMULARIO COMPLETO de atributos (todos os grupos e campos do catalogo,
// um card por grupo), por PROPS -- nao le useParams() e nao conhece nenhum modulo. Serve produto e
// servico: quem monta informa o catalogo, as linhas atuais (`rows`) e recebe as novas em `onChange`.
// Fica dentro do <form> do cadastro/edicao do registro; o pai envia `rows` junto com o corpo do registro
// (a API grava tudo na mesma transacao). Campo unico vira um controle pelo `type` do catalogo
// (texto, select de enum, Sim/Nao, data, numero, valor + unidade). Campo `multiple` vira lista: entradas
// ja adicionadas (com remover) e uma linha para adicionar (valor, unidade e, na especificacao, o nome).
// Controles pelo <FormGrid>; sem `name`, para nao entrar no FormData do <form>.
import { useMemo, useState } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { AnyFieldSchema, FormGridSchema } from '@/components/ui/FormGrid/Input';
import { fieldLabel, valueLabel } from '@/catalogs/fieldLabels';
import { CLEARED_FIELD_VALUE } from '@/utils/formSubmit';
import type { AttributeRow } from '@/utils/attributeRows';
import type { AttributeCatalog, AttributeField } from '@/types/attributeCatalog';

export interface AttributeFormProps {
  catalog: AttributeCatalog;
  rows: AttributeRow[];
  onChange: (rows: AttributeRow[]) => void;
  title?: string;
}

const MEASURE: ReadonlySet<string> = new Set(['medida', 'faixa']);
const NUMBER: ReadonlySet<string> = new Set(['integer', 'decimal']);

/** Unidade padrao do catalogo; texto livre como "% ou mg" nao serve de padrao. */
const defaultUnit = (field: AttributeField): string => (field.unit && !field.unit.includes(' ') ? field.unit : '');

const clean = (v: string): string => (v === CLEARED_FIELD_VALUE ? '' : v);

const same = (row: AttributeRow, group: string, field: string): boolean => row.group_code === group && row.field_code === field;

const asBlocks = (fields: AnyFieldSchema[], size: number): FormGridSchema => ({
  rows: Array.from({ length: Math.ceil(fields.length / size) }, (_, i) => ({ fields: fields.slice(i * size, i * size + size) })),
});

/** Campos de formulario de UM campo do catalogo (valor e, se medida, unidade), cada bloco com 4 colunas. */
function controls(
  field: AttributeField,
  code: string,
  value: string,
  unit: string,
  setValue: (v: string) => void,
  setUnit: (v: string) => void,
  idBase: string,
  labelText?: string,
): AnyFieldSchema[] {
  const label = labelText ?? fieldLabel(code);
  const hint = field.note ? { title: field.note } : {};
  if (field.type === 'enum' && field.values) {
    return [
      {
        type: 'select',
        id: idBase,
        col: 4,
        label,
        ...hint,
        options: field.values.map((v) => ({ value: v, label: valueLabel(v) })),
        valueKey: 'value',
        labelKey: 'label',
        value,
        onChange: (v) => setValue(clean(v)),
      },
    ];
  }
  if (field.type === 'boolean') {
    return [
      {
        type: 'select',
        id: idBase,
        col: 4,
        label,
        ...hint,
        options: [
          { value: 'true', label: 'Sim' },
          { value: 'false', label: 'Não' },
        ],
        valueKey: 'value',
        labelKey: 'label',
        value,
        onChange: (v) => setValue(clean(v)),
      },
    ];
  }
  if (field.type === 'date') {
    return [{ type: 'data', id: idBase, col: 4, label, ...hint, value, onChange: (e) => setValue(e.target.value) }];
  }
  if (MEASURE.has(field.type)) {
    return [
      { id: idBase, col: 2, label, ...hint, inputMode: 'decimal', value, onChange: (e) => setValue(e.target.value.replace(',', '.')) },
      { id: `${idBase}-unit`, col: 2, label: 'Unidade', value: unit, onChange: (e) => setUnit(e.target.value) },
    ];
  }
  if (NUMBER.has(field.type)) {
    return [{ id: idBase, col: 4, label, ...hint, inputMode: 'decimal', value, onChange: (e) => setValue(e.target.value.replace(',', '.')) }];
  }
  return [{ id: idBase, col: 4, label, ...hint, value, maxLength: 500, onChange: (e) => setValue(e.target.value) }];
}

interface MultiFieldProps {
  group: string;
  code: string;
  field: AttributeField;
  rows: AttributeRow[];
  onChange: (rows: AttributeRow[]) => void;
}

/** Campo que pode se repetir: lista de entradas + linha para adicionar. */
function MultiField({ group, code, field, rows, onChange }: MultiFieldProps) {
  const needsLabel = code === 'especificacao';
  const [draft, setDraft] = useState({ value: '', unit: defaultUnit(field), label: '' });
  const entries = rows.filter((r) => same(r, group, code) && r.value.trim() !== '');

  const schema = useMemo<FormGridSchema>(() => {
    const fields: AnyFieldSchema[] = [];
    if (needsLabel) {
      fields.push({ id: `attr-${group}-${code}-new-label`, col: 4, label: 'Nome da especificação', value: draft.label, onChange: (e) => setDraft((d) => ({ ...d, label: e.target.value })) });
    }
    fields.push(
      ...controls(
        field,
        needsLabel ? 'valor' : code,
        draft.value,
        draft.unit,
        (v) => setDraft((d) => ({ ...d, value: v })),
        (v) => setDraft((d) => ({ ...d, unit: v })),
        `attr-${group}-${code}-new`,
        'Valor',
      ),
    );
    return asBlocks(fields, 3);
  }, [field, group, code, needsLabel, draft]);

  const add = () => {
    if (draft.value.trim() === '' || (needsLabel && draft.label.trim() === '')) return;
    const row: AttributeRow = {
      group_code: group,
      field_code: code,
      value: draft.value.trim(),
      ...(MEASURE.has(field.type) && draft.unit.trim() !== '' ? { unit: draft.unit.trim() } : {}),
      ...(needsLabel ? { label: draft.label.trim() } : {}),
    };
    onChange([...rows, row]);
    setDraft({ value: '', unit: defaultUnit(field), label: '' });
  };

  const shown = (row: AttributeRow): string => {
    const text = row.value === 'true' ? 'Sim' : row.value === 'false' ? 'Não' : row.value;
    return `${row.label ? `${row.label}: ` : ''}${text}${row.unit ? ` ${row.unit}` : ''}`;
  };

  return (
    <div className="border rounded p-2 mb-3">
      <div className="small text-body-secondary mb-1">
        {fieldLabel(code)} <span className="fst-italic">(pode repetir)</span>
      </div>
      {entries.length > 0 ? (
        <div className="d-flex flex-wrap gap-2 mb-2">
          {entries.map((row, index) => (
            <span className="badge text-bg-light border d-inline-flex align-items-center gap-2" key={`${shown(row)}-${index}`}>
              {shown(row)}
              <button
                type="button"
                className="btn-close btn-sm"
                aria-label={`Remover ${shown(row)}`}
                onClick={() => onChange(rows.filter((r) => r !== row))}
              />
            </span>
          ))}
        </div>
      ) : null}
      <FormGrid schema={schema} />
      <button type="button" className="btn btn-outline-primary btn-sm" data-attr-add={`${group}.${code}`} onClick={add}>
        <i className="bi bi-plus-lg me-1" aria-hidden="true" />
        Adicionar {fieldLabel(code).toLowerCase()}
      </button>
    </div>
  );
}

interface GroupCardProps {
  group: string;
  label: string;
  fields: Record<string, AttributeField>;
  rows: AttributeRow[];
  onChange: (rows: AttributeRow[]) => void;
}

function GroupCard({ group, label, fields, rows, onChange }: GroupCardProps) {
  const [open, setOpen] = useState(true);
  const singles = Object.entries(fields).filter(([, f]) => f.multiple !== true);
  const multiples = Object.entries(fields).filter(([, f]) => f.multiple === true);
  const filled = rows.filter((r) => r.group_code === group && r.value.trim() !== '').length;

  const setSingle = (code: string, def: AttributeField, patch: { value?: string; unit?: string }) => {
    const existing = rows.find((r) => same(r, group, code));
    const next: AttributeRow = {
      group_code: group,
      field_code: code,
      value: patch.value ?? existing?.value ?? '',
      ...(MEASURE.has(def.type) ? { unit: patch.unit ?? existing?.unit ?? defaultUnit(def) } : {}),
    };
    onChange(existing ? rows.map((r) => (r === existing ? next : r)) : [...rows, next]);
  };

  const schema = useMemo<FormGridSchema>(() => {
    const list: AnyFieldSchema[] = singles.flatMap(([code, def]) => {
      const row = rows.find((r) => same(r, group, code));
      return controls(
        def,
        code,
        row?.value ?? '',
        row?.unit ?? defaultUnit(def),
        (v) => setSingle(code, def, { value: v }),
        (v) => setSingle(code, def, { unit: v }),
        `attr-${group}-${code}`,
      );
    });
    // Blocos de 4 colunas: tres por linha (um campo de medida ocupa valor 2 + unidade 2 = 4).
    const out: AnyFieldSchema[][] = [];
    let line: AnyFieldSchema[] = [];
    let used = 0;
    for (const f of list) {
      if (used + f.col > 12) {
        out.push(line);
        line = [];
        used = 0;
      }
      line.push(f);
      used += f.col;
    }
    if (line.length > 0) out.push(line);
    return { rows: out.map((fields) => ({ fields })) };
    // setSingle depende de rows/onChange, ja nas dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, group]);

  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>
          {label}
          {filled > 0 ? <span className="badge text-bg-primary ms-2">{filled}</span> : null}
        </span>
        <button type="button" className="btn btn-sm btn-outline-secondary" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} aria-hidden="true" />
          <span className="visually-hidden">{open ? 'Recolher' : 'Expandir'}</span>
        </button>
      </div>
      {open ? (
        <div className="card-body">
          {singles.length > 0 ? <FormGrid schema={schema} /> : null}
          {multiples.map(([code, def]) => (
            <MultiField key={code} group={group} code={code} field={def} rows={rows} onChange={onChange} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AttributeForm({ catalog, rows, onChange, title = 'Características' }: AttributeFormProps) {
  return (
    <section className="mt-4" aria-label={title}>
      <h2 className="h5 mb-3">{title}</h2>
      {Object.entries(catalog).map(([group, def]) => (
        <GroupCard key={group} group={group} label={def.label} fields={def.fields} rows={rows} onChange={onChange} />
      ))}
    </section>
  );
}
