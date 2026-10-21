// Componente global reutilizavel: EDITOR DE ATRIBUTOS (grupo -> campo -> valor/unidade) dirigido por
// CATALOGO, por PROPS -- nao le useParams() e nao conhece nenhum modulo. Serve produto e servico:
// quem monta informa o catalogo (src/catalogs), a chave do dono (`product_id`/`service_id`), o id,
// a view (listar) e a tabela (gravar/excluir). O usuario escolhe Grupo, depois Campo, e o controle do
// valor segue o `type` do campo (enum vira select, boolean vira Sim/Nao, medida vira valor +
// unidade, date vira data). Campo que nao e `multiple` e ja existe e atualizado em vez de duplicado.
// Campos pelo <FormGrid>; nada de <input> a mao.
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fieldLabel, valueLabel } from '@/catalogs/fieldLabels';
import ConfirmModal from '@/components/global/ConfirmModal';
import FormGrid from '@/components/ui/FormGrid/Input';
import type { AnyFieldSchema, FormGridSchema } from '@/components/ui/FormGrid/Input';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import type { ResourceReader, ResourceWriter } from '@/services/resourceFactory';
import { normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import type { AttributeCatalog, AttributeField } from '@/types/attributeCatalog';

export interface AttributeEditorProps {
  catalog: AttributeCatalog;
  /** Coluna do dono nas linhas de atributo (ex.: 'product_id'). */
  ownerKey: string;
  ownerId: string;
  /** View de atributos (listar por dono). */
  list: Pick<ResourceReader, 'find'>;
  /** Tabela de atributos (criar, atualizar, excluir). */
  table: Pick<ResourceWriter, 'create' | 'update' | 'deleteSoft'>;
  title?: string;
}

const MEASURE_TYPES: ReadonlySet<string> = new Set(['medida', 'faixa']);
const NUMBER_TYPES: ReadonlySet<string> = new Set(['integer', 'decimal']);

const shown = (row: ApiRow): string => {
  const value = toText(row.value, '');
  const unit = toText(row.unit, '');
  const text = value === 'true' ? 'Sim' : value === 'false' ? 'Não' : value;
  return unit ? `${text} ${unit}` : text;
};

export default function AttributeEditor({ catalog, ownerKey, ownerId, list, table, title = 'Características' }: AttributeEditorProps) {
  const toast = useToast();
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [group, setGroup] = useState('');
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [target, setTarget] = useState<ApiRow | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    list
      .find({ [ownerKey]: ownerId }, { limit: 500, sort: 'sort_order', order: 'ASC' })
      .then((raw) => {
        if (alive) setRows(normalizeList(raw).rows);
      })
      .catch(() => {
        if (alive) setRows([]);
      });
    return () => {
      alive = false;
    };
  }, [list, ownerKey, ownerId, version]);

  const fieldDef: AttributeField | undefined = catalog[group]?.fields[field];
  const needsLabel = field === 'especificacao';

  const grouped = useMemo(() => {
    const map = new Map<string, ApiRow[]>();
    for (const row of rows) {
      const key = toText(row.group_code, '');
      map.set(key, [...(map.get(key) ?? []), row]);
    }
    return [...map.entries()].sort(([a], [b]) => {
      const keys = Object.keys(catalog);
      const ia = keys.indexOf(a);
      const ib = keys.indexOf(b);
      return (ia < 0 ? keys.length : ia) - (ib < 0 ? keys.length : ib);
    });
  }, [rows, catalog]);

  const schema = useMemo<FormGridSchema>(() => {
    const fields: AnyFieldSchema[] = [
      {
        type: 'select',
        col: 4,
        label: 'Grupo',
        name: 'group_code',
        options: Object.entries(catalog).map(([code, g]) => ({ value: code, label: g.label })),
        valueKey: 'value',
        labelKey: 'label',
        value: group,
        onChange: (v) => {
          setGroup(v);
          setField('');
          setValue('');
          setUnit('');
        },
      },
      {
        type: 'select',
        col: 4,
        label: 'Campo',
        name: 'field_code',
        options: Object.keys(catalog[group]?.fields ?? {}).map((code) => ({ value: code, label: fieldLabel(code) })),
        valueKey: 'value',
        labelKey: 'label',
        value: field,
        disabled: group === '',
        onChange: (v) => {
          setField(v);
          setValue('');
          setUnit(catalog[group]?.fields[v]?.unit ?? '');
        },
      },
    ];

    if (fieldDef) {
      const type = fieldDef.type;
      if (needsLabel) {
        fields.push({ col: 4, label: 'Nome da especificação', name: 'label', value: label, onChange: (e) => setLabel(e.target.value) });
      }
      if (type === 'enum' && fieldDef.values) {
        fields.push({
          type: 'select',
          col: 4,
          label: 'Valor',
          name: 'value',
          options: fieldDef.values.map((v) => ({ value: v, label: valueLabel(v) })),
          valueKey: 'value',
          labelKey: 'label',
          value,
          onChange: (v) => setValue(v),
        });
      } else if (type === 'boolean') {
        fields.push({
          type: 'select',
          col: 4,
          label: 'Valor',
          name: 'value',
          options: [
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ],
          valueKey: 'value',
          labelKey: 'label',
          value,
          onChange: (v) => setValue(v),
        });
      } else if (type === 'date') {
        fields.push({ type: 'data', col: 4, label: 'Valor', name: 'value', value, onChange: (e) => setValue(e.target.value) });
      } else {
        fields.push({
          col: MEASURE_TYPES.has(type) ? 2 : 4,
          label: 'Valor',
          name: 'value',
          value,
          ...(MEASURE_TYPES.has(type) || NUMBER_TYPES.has(type) ? { inputMode: 'decimal' as const } : {}),
          onChange: (e) => setValue(MEASURE_TYPES.has(type) || NUMBER_TYPES.has(type) ? e.target.value.replace(',', '.') : e.target.value),
        });
      }
      if (MEASURE_TYPES.has(type)) {
        fields.push({ col: 2, label: 'Unidade', name: 'unit', value: unit, onChange: (e) => setUnit(e.target.value) });
      }
    }

    return { rows: [{ fields }] };
  }, [catalog, group, field, fieldDef, needsLabel, value, unit, label]);

  const add = async () => {
    if (!fieldDef || value.trim() === '') {
      toast.error('Escolha grupo, campo e informe o valor.');
      return;
    }
    if (needsLabel && label.trim() === '') {
      toast.error('Informe o nome da especificação.');
      return;
    }
    const body: Record<string, unknown> = {
      [ownerKey]: ownerId,
      group_code: group,
      field_code: field,
      value: value.trim(),
      ...(unit.trim() !== '' && MEASURE_TYPES.has(fieldDef.type) ? { unit: unit.trim() } : {}),
      ...(needsLabel ? { label: label.trim() } : {}),
    };
    const existing = fieldDef.multiple
      ? undefined
      : rows.find((row) => toText(row.group_code, '') === group && toText(row.field_code, '') === field);
    setBusy(true);
    try {
      if (existing) {
        const { [ownerKey]: _owner, ...patch } = body;
        void _owner;
        await table.update(toText(existing.id, ''), patch);
      } else {
        await table.create(body);
      }
      toast.success(existing ? 'Característica atualizada.' : 'Característica adicionada.');
      setValue('');
      setLabel('');
      reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao gravar a característica.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await table.deleteSoft(toText(target.id, ''));
      toast.success('Característica excluída.');
      setTarget(null);
      reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao excluir a característica.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-header">{title}</div>
      <div className="card-body">
        {grouped.length === 0 ? <p className="text-body-secondary">Nenhuma característica cadastrada.</p> : null}
        {grouped.map(([code, items]) => (
          <div className="mb-3" key={code}>
            <h2 className="h6 text-body-secondary">{catalog[code]?.label ?? fieldLabel(code)}</h2>
            <ul className="list-group">
              {items.map((row) => (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={toText(row.id, '')}>
                  <span>
                    <strong>{toText(row.label, '') || fieldLabel(toText(row.field_code, ''))}</strong>: {shown(row)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    title="Excluir"
                    aria-label="Excluir"
                    disabled={busy}
                    onClick={() => setTarget(row)}
                  >
                    <i className="bi bi-trash" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <hr />
        <FormGrid schema={schema} />
        {fieldDef?.note ? <p className="small text-body-secondary">{fieldDef.note}</p> : null}
        <button type="button" className="btn btn-primary btn-sm" disabled={busy || !fieldDef} onClick={() => void add()}>
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
          Adicionar
        </button>
      </div>
      <ConfirmModal
        open={target !== null}
        title="Excluir característica"
        message={`Excluir "${toText(target?.label, '') || fieldLabel(toText(target?.field_code, ''))}"?`}
        confirmLabel="Excluir"
        variant="danger"
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
