// Árvore de hierarquia do FormBuilderPage — espelha o visual do modelo
// `doc/html/estrutura.html`: cada nível é uma LINHA compacta com chevron; clicar
// expande/recolhe só a estrutura (os nós filhos), nunca despeja formulário
// inline. O formulário de cada nó abre num <FormModal> (prop `onEdit`).
//
// Diferença deliberada do modelo: o colapso é estado React, não
// `data-bs-toggle="collapse"` — o React é dono desses nós.
//
// `<FormTree>` guarda o Set de ids expandidos + o Set de todos os ids montados
// (para "Expandir tudo"). Um nó montado DEPOIS da carga inicial é tratado como
// novo: abre a si e a toda a cadeia de pais, rola até ele e pisca (`lastAdded`).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

interface TreeCtx {
  isExpanded: (id: string) => boolean;
  toggle: (id: string) => void;
  register: (id: string, parents: string[]) => void;
  unregister: (id: string) => void;
  lastAdded: string | null;
}

const Ctx = createContext<TreeCtx | null>(null);

function useTree(): TreeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('<TreeNode> precisa estar dentro de <FormTree>.');
  return ctx;
}

// ─── <FormTree> ────────────────────────────────────────────────────────────

export function FormTree({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const ready = useRef(false);

  // Fim da montagem inicial — o que se registrar depois disso é "novo".
  useEffect(() => {
    const t = window.setTimeout(() => {
      ready.current = true;
    }, 80);
    return () => window.clearTimeout(t);
  }, []);

  const register = useCallback((id: string, parents: string[]) => {
    setIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    if (seen.current.has(id)) return;
    seen.current.add(id);
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (ready.current) parents.forEach((p) => next.add(p));
      return next;
    });
    if (ready.current) setLastAdded(id);
  }, []);

  const unregister = useCallback((id: string) => {
    seen.current.delete(id);
    setIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setExpanded((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isExpanded = useCallback((id: string) => expanded.has(id), [expanded]);
  const expandAll = useCallback(() => setExpanded(new Set(ids)), [ids]);
  const collapseAll = useCallback(() => setExpanded(new Set()), []);

  const ctx = useMemo<TreeCtx>(
    () => ({ isExpanded, toggle, register, unregister, lastAdded }),
    [isExpanded, toggle, register, unregister, lastAdded],
  );

  return (
    <Ctx.Provider value={ctx}>
      <div className="form-tree">
        <div
          className="btn-group btn-group-sm mb-2"
          role="group"
          aria-label="Colapso da árvore"
        >
          <button type="button" className="btn btn-outline-secondary" onClick={expandAll}>
            <i className="bi bi-arrows-expand me-1" />
            Expandir tudo
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={collapseAll}>
            <i className="bi bi-arrows-collapse me-1" />
            Recolher tudo
          </button>
        </div>
        {children}
      </div>
    </Ctx.Provider>
  );
}

// ─── <TreeNode> ───────────────────────────────────────────────────────────

export type TreeLevel = 'manager' | 'group' | 'row' | 'field';

const LEVEL: Record<TreeLevel, { icon: string; kind: string }> = {
  manager: { icon: 'bi-ui-checks-grid', kind: 'form_manager' },
  group: { icon: 'bi-folder2', kind: 'form_groups' },
  row: { icon: 'bi-layout-three-columns', kind: 'form_rows' },
  field: { icon: 'bi-input-cursor-text', kind: 'form_fields' },
};

interface TreeNodeProps {
  /** Chave estável de expansão (única na árvore). */
  id: string;
  /** Ids dos nós ancestrais, do topo para o pai direto. */
  parents: string[];
  level: TreeLevel;
  /** Nome da instância — título do grupo, nota da linha, nome da coluna. */
  name?: string;
  /** Contador exibido como pill (nº de filhos). */
  count?: number;
  /** Texto do botão [+] (nome da tabela-filha). Sem `onAdd` → sem botão. */
  addLabel?: string;
  onAdd?: () => void;
  /** Desabilita o [+] enquanto o nível acima não estiver persistido. */
  addDisabled?: boolean;
  /** Abre o formulário do nó no modal. Sem `onEdit` → sem botão. */
  onEdit?: () => void;
  onRemove?: () => void;
  /** <TreeNode> filhos. */
  children?: ReactNode;
}

export function TreeNode(props: TreeNodeProps) {
  const {
    id,
    parents,
    level,
    name,
    count,
    addLabel,
    onAdd,
    addDisabled,
    onEdit,
    onRemove,
    children,
  } = props;
  const { isExpanded, toggle, register, unregister, lastAdded } = useTree();
  const domId = useId();
  const rowRef = useRef<HTMLDivElement>(null);

  const parentsKey = parents.join('>');
  const parentsRef = useRef(parents);
  parentsRef.current = parents;

  const meta = LEVEL[level];
  const canExpand = level !== 'field';
  const open = isExpanded(id);

  // Registro/baixa do nó na árvore. Depende só de `id`/`parentsKey` (string) —
  // o valor atual de `parents` vem do ref, então o efeito não re-roda a cada
  // render mesmo com array novo.
  useEffect(() => {
    register(id, parentsRef.current);
    return () => unregister(id);
  }, [id, parentsKey, register, unregister]);

  // Nó recém-adicionado: rola até a linha e pisca.
  useEffect(() => {
    if (lastAdded !== id || !rowRef.current) return;
    const el = rowRef.current;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.classList.add('tree-flash');
    const t = window.setTimeout(() => el.classList.remove('tree-flash'), 1500);
    return () => window.clearTimeout(t);
  }, [lastAdded, id]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (canExpand && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggle(id);
    }
  };

  return (
    <div className="tree-node">
      <div ref={rowRef} className="tree-row d-flex align-items-center gap-1 rounded px-1">
        <div
          className="tree-toggle d-flex align-items-center gap-2 flex-grow-1 py-1 px-1"
          role={canExpand ? 'button' : undefined}
          tabIndex={canExpand ? 0 : undefined}
          aria-expanded={canExpand ? open : undefined}
          aria-controls={canExpand ? domId : undefined}
          onClick={canExpand ? () => toggle(id) : undefined}
          onKeyDown={onKeyDown}
        >
          <i
            className={`bi bi-chevron-right tree-chevron small${canExpand ? '' : ' invisible'}`}
          />
          <i className={`bi ${meta.icon} text-secondary`} />
          <span className="fw-semibold">{meta.kind}</span>
          {name ? (
            <span className="text-body-secondary text-truncate">· {name}</span>
          ) : null}
          {typeof count === 'number' ? (
            <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
              {count}
            </span>
          ) : null}
        </div>

        {onEdit ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onEdit}
            title="Abrir formulário"
          >
            <i className="bi bi-pencil-square" />
          </button>
        ) : null}
        {onAdd ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary text-nowrap"
            onClick={onAdd}
            disabled={addDisabled}
            title={
              addDisabled
                ? 'Salve o nível acima primeiro'
                : `Adicionar ${addLabel ?? ''}`
            }
          >
            <i className="bi bi-plus-lg me-1" />
            {addLabel}
          </button>
        ) : null}
        {onRemove ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={onRemove}
            aria-label="Remover"
            title="Remover"
          >
            <i className="bi bi-trash3" />
          </button>
        ) : null}
      </div>

      {canExpand ? (
        <div id={domId} className={`tree-children${open ? '' : ' d-none'}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
