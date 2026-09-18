/**
 * =============================================================================
 * FILE HEADER — ListBuilderTree (árvore do construtor de LISTAS; fork)
 * =============================================================================
 *
 * O QUE FAZ:
 *   A árvore de hierarquia do `ListBuilderPage`, nos mesmos moldes do
 *   `FormBuilderTree.tsx` (do qual este arquivo é FORK — ver SINCRONIA abaixo):
 *   `<ListTree>` é o provider do colapso (com os botões "Expandir tudo"/
 *   "Recolher tudo") e `<ListTreeNode>` é UMA linha da árvore — chevron,
 *   ícone/rótulo do nível, nome da instância, pill de contagem e as ações
 *   (botão Editar, botão Adicionar filho, botão Remover) + o container dos filhos.
 *   Clicar na linha abre/fecha só a ESTRUTURA; editar é ação explícita (botão
 *   Editar), que abre um `<FormModal>` pela prop `onEdit`.
 *
 * DIFERENÇAS EM RELAÇÃO AO ORIGINAL (`pages/v1/form/FormBuilderTree.tsx`):
 *   1. 3 NÍVEIS, com IRMÃOS: `manager` -> `column` + `action`. No form são 4
 *      níveis em cadeia (manager -> group -> row -> field); aqui as duas coleções
 *      filhas não têm relação entre si.
 *   2. `canExpand = level === 'manager'`: só a RAIZ expande. No form ocorre o
 *      oposto (só o último nível, `field`, é folha) — e a regra está embutida
 *      no componente, não no mapa de níveis.
 *   3. `addActions` é ARRAY (em vez de `onAdd`/`addLabel` únicos), porque o
 *      manager tem DOIS botões Adicionar (`list_columns` e `list_actions`). Cada
 *      item traz `label`, `onAdd` e `disabled`.
 *   Também mudam os nomes: `ListTree`/`ListTreeNode`, `ListTreeLevel`/`LEVEL`
 *   (ícones e `kind` dos 3 níveis) e a mensagem do `useTree`.
 *
 * SINCRONIA (regra desta dupla de arquivos):
 *   TUDO o que não está listado acima é igual ao original — colapso por estado
 *   React (nunca `data-bs-toggle`), filhos escondidos com `.d-none` (não
 *   desmontados), registro idempotente via `seen`/`ready`, abertura da cadeia de
 *   `parents` + `scrollIntoView`/`tree-flash` quando um nó novo nasce, teclado
 *   (Enter/Espaço) e `role`/`aria-*` só no nível que expande. Ao corrigir algo
 *   neste arquivo, verifique se o `FormBuilderTree.tsx` precisa do mesmo ajuste
 *   (e vice-versa): o corpo dos dois é praticamente idêntico. A explicação
 *   detalhada de cada mecanismo está nos BLOCOS daquele arquivo; aqui os blocos
 *   resumem e destacam a diferença.
 *
 * DEPENDÊNCIAS:
 *   - `react` (context, hooks, `useId`) — nada além disso.
 *   - `styles/_custom.scss`: as classes `.form-tree`, `.tree-*` e o
 *     `@keyframes tree-flash` são COMPARTILHADAS com a árvore do form (o fork
 *     não trouxe CSS novo). Os 1500 ms do flash no JS correspondem ao mesmo
 *     `@keyframes` — mexeu num lado, mexa no outro.
 *
 * CONSUMIDORES:
 *   - `pages/v1/list/ListBuilderPage.tsx` — monta `<ListTree>` uma vez, com um
 *     `<ListTreeNode level="manager">` e, dentro dele, os nós `column`/`action`.
 *     É de lá que vêm os textos de árvore vazia, via `children`.
 *
 * COMO REAPROVEITAR (outra árvore de 1..N níveis):
 *   1. Copie este arquivo e troque `ListTreeLevel`/`LEVEL` (ícones e rótulos).
 *   2. Ajuste `canExpand` para a regra da sua hierarquia (quem tem filho).
 *   3. Nó com mais de uma coleção filha -> `addActions` (array); com um filho só,
 *      o `FormBuilderTree` (`onAdd`/`addLabel`) é mais simples.
 *   4. Na página, monte os nós por `.map()` passando a cadeia COMPLETA de
 *      `parents`, com `id` único por nível (`manager:<id>`, `column:<uuid>`...).
 *
 * ARMADILHAS:
 *   1. O `id` precisa ser único na árvore e ESTÁVEL por nó: trocar o `id` de um
 *      nó já montado dispara unregister+register e o nó passa a ser tratado como
 *      NOVO (abre os pais e pisca), como no original.
 *   2. Fechar NÃO desmonta: `register` roda uma vez por nó, então "Expandir
 *      tudo" já encontra todos os ids em `ids`.
 *   3. `parents` chega como array novo a cada render — por isso o efeito depende
 *      da string `parentsKey` e lê o valor atual pelo `parentsRef`.
 * =============================================================================
 */

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

/**
 * =============================================================================
 * BLOCO 1 — CONTEXTO DE EXPANSÃO (`TreeCtx` / `Ctx` / `useTree`)
 * =============================================================================
 *
 * Mesmo desenho do `FormBuilderTree` (ver BLOCO 1 lá): o contexto é a ponte
 * entre o `<ListTree>` (dono do estado) e cada `<ListTreeNode>` (que só
 * desenha), evitando passar props de colapso por todos os níveis.
 *
 * O QUE O NÓ CONSOME: `isExpanded(id)` (chevron, `aria-expanded`, `.d-none`),
 *   `toggle(id)` (clique, Enter, Espaço), `register(id, parents)` (na montagem),
 *   `unregister(id)` (na desmontagem) e `lastAdded` (id do último nó criado, que
 *   rola e pisca).
 *
 * POR QUE `useTree()` LANÇA: `<ListTreeNode>` fora do `<ListTree>` renderizaria
 *   sem chevron e sem expandir nada — quebrado em silêncio. O `throw` troca isso
 *   por erro de uso imediato, com a mensagem citando o provider correto DESTE
 *   arquivo.
 * -------------------------------------------------------------------------
 */

/**
 * Valor do contexto: o `<ListTree>` monta este objeto no `useMemo` e os nós
 * apenas leem. É a API pública do colapso — mexer aqui mexe em todos os nós.
 */
interface TreeCtx {
  isExpanded: (id: string) => boolean;
  toggle: (id: string) => void;
  register: (id: string, parents: string[]) => void;
  unregister: (id: string) => void;
  lastAdded: string | null;
}

/** Contexto da árvore; `null` = nenhum `<ListTree>` acima (ver `useTree`). */
const Ctx = createContext<TreeCtx | null>(null);

/**
 * Atalho de leitura do contexto, usado só pelo `<ListTreeNode>`.
 * @returns o `TreeCtx` do `<ListTree>` mais próximo
 * @throws Error quando o nó é renderizado fora do `<ListTree>`
 */
function useTree(): TreeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('<ListTreeNode> precisa estar dentro de <ListTree>.');
  return ctx;
}

/**
 * =============================================================================
 * BLOCO 2 — `<ListTree>`: ESTADO DE EXPANSÃO E REGISTRO DE NÓS
 * =============================================================================
 *
 * O QUE FAZ: guarda TODO o estado de colapso, publica no contexto e renderiza os
 *   dois botões de ação em massa. É o único componente com estado do arquivo.
 *
 * ESTADO (os mesmos 5 papéis do original):
 *   `ids`       todos os ids registrados — base do "Expandir tudo"
 *   `expanded`  ids abertos
 *   `lastAdded` id do último nó criado depois da montagem inicial
 *   `seen`      (ref) ids já registrados e não desregistrados — idempotência
 *   `ready`     (ref) fecha a janela de montagem inicial (timer de 80 ms)
 *
 * POR QUE 80 ms E POR QUE `useRef` EM `seen`/`ready`: ver o BLOCO 2 do
 *   `FormBuilderTree.tsx` — o intervalo separa "montagem da tela" de "nó que o
 *   usuário acabou de criar", e as refs são lidas dentro de callbacks estáveis
 *   (não devem re-renderizar ninguém).
 *
 * CONSUMIDOR: `ListBuilderPage.tsx`, que monta um `<ListTree>` para a árvore do
 *   manager selecionado (um escopo de colapso por árvore montada).
 * -------------------------------------------------------------------------
 */
export function ListTree({ children }: { children: ReactNode }) {
  // Estado que muda o desenho (3 `useState`) + decisões internas (2 refs).
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const ready = useRef(false);

  // Fim da janela de montagem inicial: o que se registrar depois disso é NÓ NOVO
  // (abre a cadeia de pais, rola até a linha e pisca).
  useEffect(() => {
    const t = window.setTimeout(() => {
      ready.current = true;
    }, 80);
    return () => window.clearTimeout(t);
  }, []);

  /**
   * Registra um nó na árvore — chamado no efeito de montagem do `<ListTreeNode>`.
   * Sempre: entra em `ids` e nasce ABERTO. Na PRIMEIRA vez de cada id (guarda
   * `seen`) e com a janela inicial fechada (`ready`), abre também a cadeia de
   * `parents` e marca `lastAdded` — é o nó novo aparecendo visível e piscando.
   * @param id      id único do nó na árvore
   * @param parents ids dos ancestrais, do topo até o pai direto
   */
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

  /**
   * Desregistra um nó (cleanup do efeito): limpa `seen`, `ids` e `expanded`.
   * Sem isso sobraria id fantasma — "Expandir tudo" tentaria abrir nós que não
   * existem mais e o Set cresceria a cada remoção/adição.
   */
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

  /**
   * Abre/fecha UM nó (clique na linha, Enter ou Espaço). Não desmonta nada: só
   * entra/sai do Set `expanded` — quem esconde é o `.d-none` do container.
   */
  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Lê o estado de UM nó — estável enquanto `expanded` não muda. */
  const isExpanded = useCallback((id: string) => expanded.has(id), [expanded]);

  /**
   * "Expandir tudo": abre todos os nós registrados. Funciona nos filhos de um
   * nó fechado porque eles já estão montados (`.d-none`), logo já estão em `ids`.
   */
  const expandAll = useCallback(() => setExpanded(new Set(ids)), [ids]);

  /** "Recolher tudo": zera os abertos; os nós continuam montados (`.d-none`). */
  const collapseAll = useCallback(() => setExpanded(new Set()), []);

  /**
   * Valor publicado no contexto (BLOCO 1). O `useMemo` evita re-render dos nós
   * quando nada do colapso mudou.
   */
  const ctx = useMemo<TreeCtx>(
    () => ({ isExpanded, toggle, register, unregister, lastAdded }),
    [isExpanded, toggle, register, unregister, lastAdded],
  );

  return (
    <Ctx.Provider value={ctx}>
      <div className="form-tree">
        {/* Ações em massa: dependem do estado de expansão guardado aqui. */}
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

/**
 * =============================================================================
 * BLOCO 3 — `<ListTreeNode>`: NÍVEIS (`ListTreeLevel`/`LEVEL`) E PROPS
 * =============================================================================
 *
 * O QUE FAZ: fecha o contrato do nó antes de qualquer lógica:
 *   `ListTreeLevel`    união dos 3 níveis (o compilador barra `level` inválido)
 *   `LEVEL`            mapa nível -> `icon` (Bootstrap Icons) + `kind` (rótulo em
 *                      snake_case exibido na linha, igual ao nome da tabela)
 *   `ListTreeAddAction` um botão Adicionar: `label`, `onAdd` e `disabled`
 *   `ListTreeNodeProps` tudo o que a página pode passar
 *
 * POR QUE `addActions` É LISTA (diferença nº 3 em relação ao original):
 *   o nó `manager` tem DUAS coleções filhas irmãs (`list_columns` e
 *   `list_actions`), então precisa de dois botões Adicionar. No `FormBuilderTree` existe só
 *   um filho por nível, e por isso lá a prop é o par `onAdd`/`addLabel`.
 *   `key={a.label}` no `.map()` de renderização assume que os labels do MESMO nó
 *   são distintos (são: os nomes das tabelas-filhas).
 *
 * O QUE MUDA DE UM NÍVEL PARA OUTRO (e só isso): `icon`/`kind` no `LEVEL` e
 *   quem expande (`canExpand`, no BLOCO 4). As colunas e ações são FOLHAS — não
 *   têm botão Adicionar nem chevron.
 *
 * COMO REAPROVEITAR: para outra hierarquia, troque os nomes dos níveis e os
 *   pares ícone/rótulo; não crie `if (level === ...)` no JSX — o que é específico
 *   de nível mora neste mapa.
 * -------------------------------------------------------------------------
 */

/**
 * Níveis da árvore do construtor de listas: a raiz (`manager`) e as duas
 * coleções filhas irmãs (`column`, `action`).
 */
export type ListTreeLevel = 'manager' | 'column' | 'action';

/**
 * Aparência e rótulo de cada nível: `icon` (classe do Bootstrap Icons) e `kind`
 * (texto snake_case exibido na linha, igual ao nome da tabela que o nível
 * representa).
 */
const LEVEL: Record<ListTreeLevel, { icon: string; kind: string }> = {
  manager: { icon: 'bi-ui-checks-grid', kind: 'list_manager' },
  column: { icon: 'bi-columns-gap', kind: 'list_columns' },
  action: { icon: 'bi-lightning-charge', kind: 'list_actions' },
};

/**
 * Um botão Adicionar do nó — o rótulo é o nome da coleção filha a criar
 * (`list_columns`/`list_actions`) e `disabled` é o gate "salve o pai primeiro".
 */
export interface ListTreeAddAction {
  label: string;
  onAdd: () => void;
  /** Desabilita o botão Adicionar enquanto o nível acima não estiver persistido. */
  disabled?: boolean;
}

/**
 * Contrato do nó. As props de AÇÃO são opcionais de propósito: sem a prop, o
 * botão correspondente não é renderizado (`onEdit` -> botão Editar,
 * `addActions` -> botão Adicionar, `onRemove` -> botão Remover).
 */
interface ListTreeNodeProps {
  // -- Identidade / estrutura ---------------------------------------------
  /** Chave estável de expansão (única na árvore). */
  id: string;
  /** Ids dos nós ancestrais, do topo para o pai direto. */
  parents: string[];
  /** Nível do nó — define ícone, rótulo e se ele tem filhos. */
  level: ListTreeLevel;

  // -- Conteúdo exibido na linha ------------------------------------------
  /** Nome da instância — slug do manager, label da coluna/ação. */
  name?: string;
  /** Contador exibido como pill (nº de filhos). */
  count?: number;

  // -- Ações (sem a prop, o botão não é renderizado) ----------------------
  /**
   * Botões Adicionar do nó. `manager` tem 2 (list_columns/list_actions são
   * coleções irmãs) — por isso é array, diferente do form (1 filho só).
   */
  addActions?: ListTreeAddAction[];
  /** Abre o formulário do nó no modal. Sem `onEdit` -> sem botão. */
  onEdit?: () => void;
  onRemove?: () => void;

  // -- Filhos --------------------------------------------------------------
  /** <ListTreeNode> filhos (só o nível `manager` expande). */
  children?: ReactNode;
}

/**
 * =============================================================================
 * BLOCO 4 — `<ListTreeNode>`: REGISTRO NA ÁRVORE, DESTAQUE E TECLADO
 * =============================================================================
 *
 * O QUE FAZ: desenha UMA linha. Ele NÃO guarda estado de aberto/fechado — lê do
 *   contexto (`open`) e devolve eventos (`toggle`). Próprios do componente são
 *   apenas as refs (`parentsRef`, para o registro; `rowRef`, para o scroll e o
 *   flash) e o `useId()` do `aria-controls`.
 *
 * CICLO DE VIDA: mount -> `register(id, parents)` (entra em `ids`, nasce aberto
 *   e, sendo nó novo, abre a cadeia de pais e ganha destaque); unmount ->
 *   `unregister(id)`. Como fechar NÃO desmonta os filhos (`.d-none`), o efeito
 *   roda UMA vez por nó.
 *
 * POR QUE `parentsKey` + `parentsRef`: `parents` é um array literal novo a cada
 *   render; usá-lo direto na dependência faria o efeito re-rodar sempre
 *   (unregister+register) e o nó pareceria "novo" de novo. A dependência é a
 *   STRING `parentsKey` e o valor atual vem do ref.
 *
 * `canExpand` — A DIFERENÇA PRINCIPAL DESTE FORK: aqui é
 *   `level === 'manager'`, ou seja, SÓ A RAIZ expande (`column` e `action` são
 *   folhas irmãs). No `FormBuilderTree` a regra é `level !== 'field'` (só a
 *   ÚLTIMA folha não expande). Em ambos, `canExpand` controla de uma vez:
 *   chevron (que fica `invisible` para não desalinhar), `role="button"`,
 *   `tabIndex`, `aria-expanded`/`aria-controls` e o container de filhos.
 *
 * ACESSIBILIDADE E DESTAQUE: `Enter`/`Espaço` alternam o nó (com
 *   `preventDefault` para o Espaço não rolar a página) e, quando `lastAdded ===
 *   id`, a linha rola ao centro e pisca por 1500 ms — o mesmo tempo do
 *   `@keyframes tree-flash` em `styles/_custom.scss`.
 *
 * O QUE NÃO EXISTE: trap de foco, restauração do foco e empilhamento de árvores
 *   (mesmo conjunto do original).
 * -------------------------------------------------------------------------
 */
export function ListTreeNode(props: ListTreeNodeProps) {
  // Desestruturação completa (sem `props.` no corpo) para o JSX ficar legível.
  const {
    id,
    parents,
    level,
    name,
    count,
    addActions,
    onEdit,
    onRemove,
    children,
  } = props;
  // Contexto do colapso (Blocos 1/2) + identidade do container + referência da
  // linha (scroll e animação de destaque).
  const { isExpanded, toggle, register, unregister, lastAdded } = useTree();
  const domId = useId();
  const rowRef = useRef<HTMLDivElement>(null);

  // `parents` chega como array NOVO a cada render: a chave em string é o que o
  // efeito observa e o ref guarda o valor atual (ver BLOCO 4).
  const parentsKey = parents.join('>');
  const parentsRef = useRef(parents);
  parentsRef.current = parents;

  // Dados derivados do nível e do contexto: aparência, se pode expandir e se
  // ESTE nó está aberto agora (o estado real mora no `<ListTree>`).
  const meta = LEVEL[level];
  // Só `manager` tem filhos (column/action são folhas) — diferente do form,
  // que só barra o último nível (`field`).
  const canExpand = level === 'manager';
  const open = isExpanded(id);

  /**
   * Registro/baixa do nó na árvore. Depende só de `id`/`parentsKey` (strings) e
   * das funções do contexto (estáveis) — o valor atual de `parents` vem do ref,
   * então o efeito NÃO re-roda a cada render mesmo recebendo array novo.
   * É aqui que o nó nasce aberto e, se for novo, dispara a abertura da cadeia.
   */
  useEffect(() => {
    register(id, parentsRef.current);
    return () => unregister(id);
  }, [id, parentsKey, register, unregister]);

  /**
   * Nó recém-adicionado: rola até ele e pisca. `lastAdded` só ganha valor depois
   * da janela de montagem inicial, então a árvore carregada do zero não pisca; a
   * limpeza remove a classe e cancela o timer se o nó sair antes do fim.
   */
  useEffect(() => {
    if (lastAdded !== id || !rowRef.current) return;
    const el = rowRef.current;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.classList.add('tree-flash');
    const t = window.setTimeout(() => el.classList.remove('tree-flash'), 1500);
    return () => window.clearTimeout(t);
  }, [lastAdded, id]);

  /**
   * Teclado da área de toggle: `Enter` e `Espaço` abrem/fecham o nó (só quando o
   * nível expande — aqui, `manager`). O `preventDefault` evita o scroll padrão do
   * Espaço.
   */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (canExpand && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggle(id);
    }
  };

  /**
   * =============================================================================
   * BLOCO 5 — `<ListTreeNode>`: RENDERIZAÇÃO DA LINHA
   * =============================================================================
   *
   * O QUE FAZ: desenha a linha em TRÊS faixas, como no original:
   *   1. `.tree-toggle` — área clicável (chevron, ícone + `kind`, `- {name}` e a
   *      pill de `count`), com `role`/`tabIndex`/`aria-*` só no nível que
   *      expande.
   *   2. Ações — botão Editar (`onEdit`), os botões Adicionar de `addActions`
   *      (`.map()`, um botão por coleção filha) e botão Remover (`onRemove`).
   *      São IRMÃS da área de toggle (por isso clicar nelas não
   *      expande/recolhe) e cada uma só existe se a prop vier.
   *   3. `.tree-children` — container dos filhos, escondido com `.d-none` quando
   *      fechado (NUNCA desmontado) e renderizado apenas em nível que expande.
   *
   * COMO REAPROVEITAR: para uma ação nova, acrescente o par opcional no BLOCO 3 e
   *   renderize-a aqui condicionalmente; para mudar o visual de um nível, mexa no
   *   `LEVEL` (BLOCO 3) em vez de criar `if (level === ...)` no JSX.
   * -------------------------------------------------------------------------
   */
  return (
    <div className="tree-node">
      <div ref={rowRef} className="tree-row d-flex align-items-center gap-1 rounded px-1">
        {/* Área clicável da linha: abre/fecha o nó (chevron + nível + nome + contagem). */}
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

        {/* Ações do nó: cada botão só existe se a prop correspondente vier. */}
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
        {/* Um botão Adicionar por coleção filha do nó (o manager tem list_columns e list_actions). */}
        {addActions?.map((a) => (
          <button
            key={a.label}
            type="button"
            className="btn btn-sm btn-outline-primary text-nowrap"
            onClick={a.onAdd}
            disabled={a.disabled}
            title={a.disabled ? 'Salve o nível acima primeiro' : `Adicionar ${a.label}`}
          >
            <i className="bi bi-plus-lg me-1" />
            {a.label}
          </button>
        ))}
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

      {/* Filhos: escondidos com .d-none quando fechado — nunca desmontados. */}
      {canExpand ? (
        <div id={domId} className={`tree-children${open ? '' : ' d-none'}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
