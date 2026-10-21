// Componente global reutilizavel: ARVORE recursiva dirigida por dados, por PROPS -- nao le
// useParams() e nao conhece nenhum modulo. Serve qualquer tabela/view com auto-relacionamento
// (id + parent_id). Carrega a lista plana UMA vez (`load`), agrupa por pai em memoria e desenha
// os nos com expandir/recolher. Linhas cujo pai nao veio na lista (ex.: pai excluido) sobem para
// o topo. Acoes por no ficam por conta de `renderActions`.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { ApiError } from '@/services/http';
import { normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

export interface TreeBuildProps {
  /** Busca a lista plana (sem paginacao) da view/tabela. */
  load: () => Promise<unknown>;
  /** Chave do id na linha. Padrao: 'id'. */
  idKey?: string;
  /** Chave do pai na linha. Padrao: 'parent_id'. */
  parentKey?: string;
  /** Texto principal do no. */
  renderLabel: (row: ApiRow) => ReactNode;
  /** Texto secundario (badge/descricao) ao lado do rotulo. */
  renderMeta?: (row: ApiRow) => ReactNode;
  /** Botoes do no (Editar, Excluir...). Chame `reload` apos mutar. */
  renderActions?: (row: ApiRow, reload: () => void) => ReactNode;
  /** Chave que muda para forcar recarga externa. */
  reloadKey?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Maior nivel oferecido no controle "Expandir ate o nivel". Padrao: 10. */
  maxLevel?: number;
}

interface NodeProps {
  row: ApiRow;
  depth: number;
  idKey: string;
  byParent: Map<string, ApiRow[]>;
  open: Set<string>;
  toggle: (id: string) => void;
  renderLabel: TreeBuildProps['renderLabel'];
  renderMeta: TreeBuildProps['renderMeta'];
  renderActions: (row: ApiRow) => ReactNode;
}

function TreeNode({ row, depth, idKey, byParent, open, toggle, renderLabel, renderMeta, renderActions }: NodeProps) {
  const id = toText(row[idKey], '');
  const children = byParent.get(id) ?? [];
  const expanded = open.has(id);

  return (
    <>
      <li className="list-group-item d-flex align-items-center gap-2 py-2" style={{ paddingLeft: `${0.75 + depth * 1.5}rem` }}>
        {children.length > 0 ? (
          <button
            type="button"
            className="btn btn-sm btn-link p-0 text-body"
            aria-expanded={expanded}
            aria-label={expanded ? 'Recolher' : 'Expandir'}
            onClick={() => toggle(id)}
          >
            <i className={`bi bi-chevron-${expanded ? 'down' : 'right'}`} aria-hidden="true" />
          </button>
        ) : (
          <span className="d-inline-block" style={{ width: '1rem' }} />
        )}
        <span className="flex-grow-1">{renderLabel(row)}</span>
        {renderMeta ? <span className="text-body-secondary small">{renderMeta(row)}</span> : null}
        <span className="text-nowrap">{renderActions(row)}</span>
      </li>
      {expanded
        ? children.map((child) => (
            <TreeNode
              key={toText(child[idKey], '')}
              row={child}
              depth={depth + 1}
              idKey={idKey}
              byParent={byParent}
              open={open}
              toggle={toggle}
              renderLabel={renderLabel}
              renderMeta={renderMeta}
              renderActions={renderActions}
            />
          ))
        : null}
    </>
  );
}

export default function TreeBuild({
  load,
  idKey = 'id',
  parentKey = 'parent_id',
  renderLabel,
  renderMeta,
  renderActions,
  reloadKey = 0,
  emptyTitle = 'Nenhum registro',
  emptyDescription = '',
  maxLevel = 10,
}: TreeBuildProps) {
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [tick, setTick] = useState(0);
  const [level, setLevel] = useState(2);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    load()
      .then((raw) => {
        if (!alive) return;
        setRows(normalizeList(raw).rows);
        setError(null);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof ApiError ? err.message : 'Falha ao carregar a arvore.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [load, tick, reloadKey]);

  const { roots, byParent } = useMemo(() => {
    const ids = new Set(rows.map((r) => toText(r[idKey], '')));
    const map = new Map<string, ApiRow[]>();
    const top: ApiRow[] = [];
    for (const row of rows) {
      const parent = toText(row[parentKey], '');
      if (parent !== '' && ids.has(parent)) {
        const list = map.get(parent) ?? [];
        list.push(row);
        map.set(parent, list);
      } else {
        top.push(row);
      }
    }
    return { roots: top, byParent: map };
  }, [rows, idKey, parentKey]);

  // Abre os nos ate o nivel N visivel (nivel 1 = so as raizes): pais de profundidade < N-1 ficam abertos.
  const expandToLevel = useCallback(
    (n: number) => {
      const next = new Set<string>();
      const walk = (list: ApiRow[], depth: number) => {
        for (const row of list) {
          const id = toText(row[idKey], '');
          const kids = byParent.get(id) ?? [];
          if (kids.length > 0 && depth < n - 1) {
            next.add(id);
            walk(kids, depth + 1);
          }
        }
      };
      walk(roots, 0);
      setOpen(next);
    },
    [roots, byParent, idKey],
  );

  const toggle = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (loading) return <LoadingOverlay />;
  if (error) return <EmptyState title="Erro ao carregar" description={error} />;
  if (roots.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setOpen(new Set(byParent.keys()))}>
          Expandir tudo
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setOpen(new Set())}>
          Recolher tudo
        </button>
        <div className="input-group input-group-sm w-auto">
          <label className="input-group-text" htmlFor="tree-level">
            Nível
          </label>
          <select
            id="tree-level"
            className="form-select"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            {Array.from({ length: maxLevel }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-outline-primary" onClick={() => expandToLevel(level)}>
            Expandir
          </button>
        </div>
      </div>
      <ul className="list-group">
        {roots.map((row) => (
          <TreeNode
            key={toText(row[idKey], '')}
            row={row}
            depth={0}
            idKey={idKey}
            byParent={byParent}
            open={open}
            toggle={toggle}
            renderLabel={renderLabel}
            renderMeta={renderMeta}
            renderActions={(r) => renderActions?.(r, reload)}
          />
        ))}
      </ul>
    </>
  );
}
