/**
 * =============================================================================
 * FILE HEADER — FormBuilderTree (árvore de hierarquia genérica + linha de nó)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Dois componentes GENÉRICOS de UI, sem nenhum conhecimento do módulo Form:
 *     <FormTree> — provider do contexto de expansão + botões "Expandir tudo"/
 *                  "Recolher tudo". Envolve uma coleção de <TreeNode>.
 *     <TreeNode> — UMA linha compacta da árvore: chevron + ícone e rótulo do
 *                  nível (`form_manager`, `form_groups`...) + nome da
 *                  instância + pill de contagem + ações opcionais
 *                  (botão Editar, botão Adicionar filho, botão Remover) + o
 *                  container dos nós filhos.
 *   Clicar na linha expande/recolhe SÓ A ESTRUTURA (os filhos) — nunca despeja
 *   formulário inline. Editar um nó é ação explícita (botão Editar) que abre um
 *   <FormModal> pela prop `onEdit`.
 *
 * DE ONDE VEM O VISUAL: `doc/html/estrutura.html` (modelo aprovado) + o bloco
 *   `.form-tree` de `styles/_custom.scss` (giro do chevron, hover, guia
 *   tracejada, `@keyframes tree-flash`). O resto é utilitário Bootstrap
 *   (`d-flex`, `gap-*`, `text-truncate`, `badge`, `btn-*`) — nada de CSS novo.
 *
 * DECISÃO A NÃO DESFAZER — colapso é estado React, NÃO `data-bs-toggle`:
 *   o React é dono dessas subárvores e o bundle JS do Bootstrap movendo/limpando
 *   nós conflita com o ciclo de render (mesmo motivo do <FormModal>). Por isso
 *   os filhos são escondidos com `.d-none` e NÃO desmontados (armadilha 2).
 *
 * CONTRATO PÚBLICO (o que a página precisa respeitar):
 *   - `id` — string ÚNICA em toda a árvore; chave de expansão e identidade do
 *     nó no registro. A página namespaceia por nível:
 *     `manager:{tabela}`, `group:{uuid}`, `row:{uuid}`,
 *     `field:{linhaId}:{coluna}`.
 *   - `parents` — ids dos ancestrais, do topo até o pai DIRETO (`[]` na raiz).
 *     É com isso que o <FormTree> abre a cadeia inteira quando um nó nasce.
 *   - `level` — `manager` | `group` | `row` | `field`; define ícone, rótulo e
 *     se o nó tem filhos (`field` é folha).
 *   - `onEdit`/`onAdd`/`onRemove` — opcionais: sem a prop, o botão não aparece.
 *   - `addDisabled` — o gate visual "salve o nível acima primeiro".
 *   - `children` — os <TreeNode> filhos (o container só existe em nível que
 *     expande).
 *
 * FLUXO DO ESTADO (quem guarda o quê):
 *   <FormTree> — `ids` (todos os montados), `expanded` (abertos), `lastAdded`
 *                (nó recém-criado) e as refs `seen`/`ready`.
 *   <TreeNode> — nenhum estado de aberto/fechado: só `parentsRef`/`rowRef` e o
 *                `useId()` do aria. Quem manda no colapso é o contexto.
 *   A PÁGINA não guarda nada de colapso: por isso cada <FormTree> é um escopo
 *   independente (um por card de tabela) e o "Expandir tudo" age só no seu.
 *
 * CICLO DE VIDA (a parte mais fácil de quebrar):
 *   1. Montagem inicial: cada nó chama `register` -> entra em `ids` e nasce
 *      ABERTO (a primeira impressão é a estrutura visível).
 *   2. O `ready` (timer de 80 ms) fecha a janela de "carga inicial": depois
 *      disso, todo `register` é NÓ NOVO -> abre a si + toda a cadeia de
 *      `parents`, rola até a linha e pisca (`tree-flash`).
 *   3. Fechar um nó NÃO desmonta os filhos (`.d-none`): o registro roda UMA vez
 *      por nó; reabrir não re-registra nem re-anima.
 *   4. `unregister` (cleanup do efeito) limpa `seen`, `ids` e `expanded` — é o
 *      que evita id fantasma na árvore ao remover um nó.
 *
 * DEPENDÊNCIAS:
 *   - `react` (context, hooks, `useId`) — nada além disso.
 *   - `styles/_custom.scss`: `.form-tree`, `.tree-row`, `.tree-toggle`,
 *     `.tree-chevron`, `.tree-children`, `.tree-flash`. Os 1500 ms do flash no
 *     JS são intencionalmente iguais ao `@keyframes tree-flash 1.5s` — mexeu
 *     num lado, mexa no outro.
 *
 * CONSUMIDORES:
 *   - `src/pages/v1/form/FormBuilderPage.tsx` (Bloco 12): 1 <FormTree> por card
 *     de tabela, com 4 níveis de <TreeNode> aninhados; é de lá que vêm os
 *     textos "Sem grupos .../Sem linhas .../Sem campos ..." (via `children`) e o
 *     sufixo `#id`/`não salvo` (com um separador antes) do `name`.
 *   - `src/pages/v1/list/ListBuilderTree.tsx` é um FORK deste arquivo
 *     (`<ListTree>`/`<ListTreeNode>`, 3 níveis: manager -> column/action).
 *     Correção feita aqui deve ser avaliada lá também — o corpo é o mesmo.
 *   - Documentação do conjunto: `src/markdown/geral/README_form_builder.md`,
 *     seção "Padrão reutilizável — árvore de hierarquia + formulário em modal".
 *
 * COMO REAPROVEITAR EM OUTRA TELA (árvore pai->filho com modal por nó):
 *   1. Copie este arquivo (ou faça um fork como o da lista) e troque só o
 *      `TreeLevel`, o mapa `LEVEL` (ícones/rótulos) e o critério de `canExpand`.
 *   2. Na página, monte `<FormTree>` UMA vez e aninhe os `<TreeNode>` por
 *      `.map()`, passando a cadeia COMPLETA de `parents` em cada nível.
 *   3. `id` sempre namespaced por nível (`nivel:{uuid}`), único na árvore.
 *   4. Renderize o modal FORA do `.map()` (um `<ModalAlvo>` discriminado por
 *      `kind` na página) — nunca dentro do nó.
 *   5. Só passe `onEdit`/`onAdd`/`onRemove` nos níveis que têm a ação: a
 *      ausência da prop é o que esconde o botão.
 *
 * ARMADILHAS (ler antes de mexer):
 *   1. O efeito de registro depende de `[id, parentsKey, register, unregister]`.
 *      `parentsKey` é `parents.join('>')` DE PROPÓSITO: o array `parents` chega
 *      novo a cada render e reiniciaria o efeito sem isso.
 *   2. Os filhos ficam no DOM quando o nó está fechado (`.d-none`), então
 *      `register` NÃO roda de novo ao expandir. Se um dia os filhos passarem a
 *      ser desmontados, o passo 3 do ciclo de vida deixa de valer.
 *   3. Trocar o `id` de um nó já montado (ex.: renomear uma coluna em
 *      `field:{linhaId}:{coluna}`) dispara unregister+register com
 *      `ready.current === true` -> o nó é tratado como NOVO (abre pais e pisca)
 *      mesmo não tendo sido criado agora.
 *   4. As ações são IRMÃS da área de toggle (não filhas): por isso clicar em
 *      Editar/Adicionar/Remover não expande/recolhe a linha. Se algum botão for movido para
 *      dentro do `.tree-toggle`, vai precisar de `stopPropagation`.
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
 * O QUE FAZ:
 *   É a ponte entre o <FormTree> (dono do estado) e cada <TreeNode> (que só
 *   desenha). O contexto evita passar props de colapso por todos os níveis
 *   aninhados — um nó não conhece irmãos nem pai, só fala com a raiz.
 *
 * O QUE O <TreeNode> CONSOME:
 *   `isExpanded(id)`        — decide chevron girado, `aria-expanded` e se o
 *                             container de filhos ganha `.d-none`
 *   `toggle(id)`            — clique na linha, `Enter` ou `Espaço`
 *   `register(id, parents)` — na montagem do nó; `parents` é a cadeia de
 *                             ancestrais usada para abrir tudo quando o nó é
 *                             NOVO
 *   `unregister(id)`        — na desmontagem (cleanup do efeito)
 *   `lastAdded`             — id do último nó criado; o nó que bater com ele
 *                             rola e pisca (`tree-flash`) uma vez
 *
 * POR QUE `useTree()` LANÇA:
 *   <TreeNode> fora de <FormTree> renderizaria sem chevron e sem expandir nada
 *   — quebrado em silêncio. O `throw` troca isso por erro de uso na hora, com a
 *   mensagem dizendo o que faltou. O `createContext(null)` é o que permite
 *   detectar "não tem provider" com `!ctx`.
 *
 * COMO REAPROVEITAR: copie o trio sem mudar nada — ele é genérico de qualquer
 *   árvore pai->filho. Ao acrescentar um comportamento novo por nó (ex.: "abrir
 *   só um ramo por vez"), o lugar é aqui + no `useMemo` do BLOCO 2.
 * -------------------------------------------------------------------------
 */

/**
 * Valor do contexto: o <FormTree> monta este objeto (no `useMemo`, BLOCO 2) e
 * os <TreeNode> apenas leem. É a API pública do colapso — mexer aqui mexe em
 * todos os nós.
 */
interface TreeCtx {
  isExpanded: (id: string) => boolean;
  toggle: (id: string) => void;
  register: (id: string, parents: string[]) => void;
  unregister: (id: string) => void;
  lastAdded: string | null;
}

/** Contexto da árvore; `null` = nenhum <FormTree> acima (ver `useTree`). */
const Ctx = createContext<TreeCtx | null>(null);

/**
 * Atalho de leitura do contexto, usado só pelo <TreeNode>.
 * @returns o `TreeCtx` do <FormTree> mais próximo
 * @throws Error quando o nó é renderizado fora do <FormTree> — falha explícita
 *         em vez de uma árvore "meio morta" (sem chevron e sem expandir)
 */
function useTree(): TreeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('<TreeNode> precisa estar dentro de <FormTree>.');
  return ctx;
}

/**
 * =============================================================================
 * BLOCO 2 — <FormTree>: ESTADO DE EXPANSÃO E REGISTRO DE NÓS
 * =============================================================================
 *
 * O QUE FAZ:
 *   Guarda TODO o estado de colapso da árvore, publica no contexto e renderiza
 *   as duas ações em massa. É o ÚNICO componente com estado deste arquivo — os
 *   <TreeNode> são visuais.
 *
 * ESTADO (peças com papéis bem distintos):
 *   `ids`       Set<string> — TODOS os ids registrados (montados). É a fonte do
 *                             "Expandir tudo": expandir = `new Set(ids)`.
 *   `expanded`  Set<string> — ids ABERTOS; fechar/reabrir só mexe aqui.
 *   `lastAdded` string|null — id do último nó criado DEPOIS da carga inicial;
 *                             o <TreeNode> correspondente rola e pisca.
 *   `seen`      ref Set     — ids que JÁ passaram por `register` e não foram
 *                             desregistrados: guarda de idempotência, para
 *                             re-registro do mesmo id não re-expandir nem
 *                             re-animar.
 *   `ready`     ref boolean — fecha a janela de montagem inicial (timer de
 *                             80 ms). Antes dela, registrar é só montar a tela;
 *                             depois, registrar = nó NOVO do usuário.
 *
 * POR QUE `useRef` EM `seen`/`ready` E `useState` NO RESTO:
 *   `seen`/`ready` são decisões internas lidas dentro de callbacks estáveis
 *   (`useCallback([])`) — não devem re-renderizar ninguém. Já `ids`, `expanded`
 *   e `lastAdded` mudam o desenho da tela.
 *
 * POR QUE 80 ms:
 *   A primeira leva de nós monta junto com a página e NÃO pode "piscar" (seria
 *   a tela inteira piscando na abertura). O intervalo é curto o bastante para
 *   ficar antes de qualquer interação e não depende da quantidade de nós — por
 *   isso um timer, e não um contador de nós.
 *
 * POR QUE TODO `setState` USA A FORMA FUNCIONAL (`prev => ...`):
 *   `register` é um `useCallback` de dependências vazias — ele não "vê" o valor
 *   atual de `ids`/`expanded`. Trabalhar com o `prev` do React é o que evita
 *   perder um nó registrado no mesmo lote de render.
 *
 * CONSUMIDORES:
 *   `FormBuilderPage.tsx` renderiza um <FormTree> por card de tabela: cada card
 *   tem o PRÓPRIO estado de expansão (um provider por árvore) e o "Expandir
 *   tudo" afeta só aquele card.
 *
 * COMO REAPROVEITAR: copie sem alteração para qualquer árvore pai->filho — o que
 *   muda é só o lado do <TreeNode> (níveis, ícones, ações).
 * -------------------------------------------------------------------------
 */

export function FormTree({ children }: { children: ReactNode }) {
  // Estado que muda o desenho (os 3 `useState`) e decisões internas lidas
  // dentro dos callbacks estáveis (as 2 refs) — papéis no cabeçalho do BLOCO 2.
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const ready = useRef(false);

  // Fim da janela de montagem inicial: o que se registrar DEPOIS deste ponto é
  // tratado como nó NOVO (abre a cadeia de pais, rola até a linha e pisca).
  // Antes dele, o registro é apenas a montagem normal da árvore.
  useEffect(() => {
    const t = window.setTimeout(() => {
      ready.current = true;
    }, 80);
    return () => window.clearTimeout(t);
  }, []);

  /**
   * Registra um nó na árvore — chamado no efeito de montagem do <TreeNode>.
   * Sempre: entra em `ids` e nasce ABERTO. Na PRIMEIRA vez de cada id (guarda
   * `seen`) e se a janela inicial já fechou (`ready`), abre também toda a
   * cadeia de `parents` e marca `lastAdded` — é o que faz o nó recém-criado
   * aparecer visível na hierarquia e piscar.
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
   * Desregistra um nó da árvore (cleanup do efeito de montagem).
   * Limpa `seen`, `ids` e `expanded` — sem isso sobraria id fantasma: o
   * "Expandir tudo" tentaria abrir nós que não existem mais e o Set cresceria
   * a cada ciclo de remoção/adição de nó.
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
   * Abre/fecha UM nó: clique na linha de estrutura, `Enter` ou `Espaço`.
   * Não desmonta nada — só entra/sai do Set `expanded` (o `.d-none` do
   * container de filhos é quem esconde).
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
   * "Expandir tudo": abre TODOS os nós registrados. Funciona para os filhos de
   * um nó fechado porque eles já estão montados (`.d-none`), logo já estão em
   * `ids` — ver passo 3 do ciclo de vida no FILE HEADER.
   */
  const expandAll = useCallback(() => setExpanded(new Set(ids)), [ids]);

  /**
   * "Recolher tudo": zera os abertos. Os nós continuam MONTADOS (viram
   * `.d-none`), então nenhum estado do nó se perde.
   */
  const collapseAll = useCallback(() => setExpanded(new Set()), []);

  /**
   * Valor publicado no contexto (BLOCO 1). O `useMemo` existe para os
   * <TreeNode> só re-renderizarem quando algo do colapso mudar — não a cada
   * render do <FormTree>.
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
 * BLOCO 3 — <TreeNode>: NÍVEIS (`TreeLevel`/`LEVEL`) E PROPS
 * =============================================================================
 *
 * O QUE FAZ:
 *   Fecha o contrato do nó ANTES de qualquer lógica:
 *     `TreeLevel`     — união dos níveis possíveis (o compilador barra um
 *                       `level="fields"` digitado errado);
 *     `LEVEL`         — mapa nível -> `icon` (Bootstrap Icons) e `kind` (rótulo
 *                       em snake_case exibido na linha, espelhando o nome da
 *                       tabela do banco);
 *     `TreeNodeProps` — tudo o que a página pode passar.
 *
 * POR QUE `kind` É SEPARADO DE `name`:
 *   `kind` vem do NÍVEL (fixo: `form_manager`, `form_groups`...) e `name` vem da
 *   INSTÂNCIA (título do grupo, nota da linha, nome da coluna). A linha mostra
 *   os dois: `form_groups` com o nome da instância e a contagem de filhos (3).
 *
 * O QUE MUDA DE UM NÍVEL PARA OUTRO (e só isso):
 *   - `icon`/`kind` no mapa `LEVEL`;
 *   - se o nível tem filhos (`canExpand`, no BLOCO 4) — `field` é folha;
 *   - quais AÇÕES a página liga (`onAdd`/`onRemove`; `onEdit` existe em todos).
 *
 * CONSUMIDORES: `FormBuilderPage.tsx` (os 4 níveis do form) e o fork
 *   `ListBuilderTree.tsx` (que troca `TreeLevel`/`LEVEL` pelos 3 níveis da
 *   lista). Ao criar um nível novo, comece por aqui.
 *
 * COMO REAPROVEITAR: para outra hierarquia, troque os nomes dos níveis e os
 *   pares ícone/rótulo. Não crie `if (level === ...)` no JSX — o que é
 *   específico de nível mora neste mapa.
 * -------------------------------------------------------------------------
 */

export type TreeLevel = 'manager' | 'group' | 'row' | 'field';

/**
 * Aparência e rótulo de cada nível: `icon` (classe do Bootstrap Icons) e `kind`
 * (texto em snake_case exibido na linha, igual ao nome da tabela que o nível
 * representa).
 */
const LEVEL: Record<TreeLevel, { icon: string; kind: string }> = {
  manager: { icon: 'bi-ui-checks-grid', kind: 'form_manager' },
  group: { icon: 'bi-folder2', kind: 'form_groups' },
  row: { icon: 'bi-layout-three-columns', kind: 'form_rows' },
  field: { icon: 'bi-input-cursor-text', kind: 'form_fields' },
};

/**
 * Contrato do nó. Todas as props de AÇÃO são opcionais DE PROPÓSITO: a ausência
 * da prop é o que esconde o botão correspondente (`onEdit` -> Editar, `onAdd` ->
 * Adicionar, `onRemove` -> Remover).
 */
interface TreeNodeProps {
  // -- Identidade / estrutura ---------------------------------------------
  /** Chave estável de expansão (única na árvore). */
  id: string;
  /** Ids dos nós ancestrais, do topo para o pai direto. */
  parents: string[];
  /** Nível do nó — define ícone, rótulo e se ele tem filhos. */
  level: TreeLevel;

  // -- Conteúdo exibido na linha ------------------------------------------
  /** Nome da instância — título do grupo, nota da linha, nome da coluna. */
  name?: string;
  /** Contador exibido como pill (nº de filhos). */
  count?: number;

  // -- Ações (sem a prop, o botão não é renderizado) ----------------------
  /** Texto do botão Adicionar (nome da tabela-filha). Sem `onAdd`, não há botão. */
  addLabel?: string;
  onAdd?: () => void;
  /** Desabilita o botão Adicionar enquanto o nível acima não estiver persistido. */
  addDisabled?: boolean;
  /** Abre o formulário do nó no modal. Sem `onEdit`, não há botão. */
  onEdit?: () => void;
  onRemove?: () => void;

  // -- Filhos -------------------------------------------------------------
  /** <TreeNode> filhos. */
  children?: ReactNode;
}

/**
 * =============================================================================
 * BLOCO 4 — <TreeNode>: REGISTRO NA ÁRVORE, DESTAQUE E TECLADO
 * =============================================================================
 *
 * O QUE FAZ:
 *   É o componente de UMA linha. Ele NÃO guarda estado de aberto/fechado: lê o
 *   estado pelo contexto (`open`) e devolve eventos (`toggle`). O que existe
 *   aqui de próprio são só as refs — `parentsRef` (para o efeito de registro) e
 *   `rowRef` (para rolar até a linha quando ela é um nó novo) — mais o `useId()`
 *   que dá identidade ao container de filhos para o `aria-controls`.
 *
 * COMO O NÓ ENTRA E SAI DA ÁRVORE:
 *   Mount -> `register(id, parents)`: entra em `ids`, nasce ABERTO e, se for nó
 *   novo, abre a cadeia de pais e ganha o destaque. Unmount ->
 *   `unregister(id)`. Como fechar NÃO desmonta os filhos (`.d-none`), esse
 *   efeito roda UMA vez por nó — não a cada expandir/recolher.
 *
 * POR QUE `parentsKey` + `parentsRef` (o detalhe mais sutil do arquivo):
 *   `parents` é um ARRAY literal criado pela página a cada render
 *   (`[managerId, groupId]`). Array novo = referência nova; usar `parents` no
 *   array de dependências faria o efeito rodar em TODO render
 *   (unregister+register) e atropelaria o "aberto/fechado" do usuário. Solução:
 *   a dependência é a STRING `parentsKey` (só muda se o conteúdo mudar) e o
 *   valor atual vem do `parentsRef`, reatribuído a cada render.
 *
 * `canExpand` E O NÍVEL FOLHA:
 *   `field` não expande — e isso desliga, de uma vez: chevron (que fica
 *   `invisible`, para o alinhamento não dançar), `role="button"`, `tabIndex`,
 *   `aria-expanded` e o container de filhos. Ou seja, a regra "folha não
 *   expande" está embutida AQUI, e não no mapa de níveis.
 *
 * ACESSIBILIDADE:
 *   A área de toggle é uma `<div role="button" tabIndex={0}>` com
 *   `aria-expanded` + `aria-controls` (o id do container vem do `useId()`,
 *   único por nó). Teclado: `Enter` e `Espaço` alternam o nó, e o
 *   `preventDefault` evita o scroll que o Espaço provoca em elemento focável.
 *
 * DESTAQUE DO NÓ NOVO:
 *   Quando `lastAdded === id`, a linha rola até o centro da tela e recebe
 *   `.tree-flash` por 1500 ms — o mesmo tempo do `@keyframes tree-flash 1.5s` em
 *   `styles/_custom.scss`. É o feedback que faz o item recém-criado aparecer
 *   VISÍVEL na hierarquia, em vez de perdido embaixo de um nó fechado.
 *
 * COMO REAPROVEITAR: em outra hierarquia (ou no fork da lista), o que muda é o
 *   `LEVEL` (BLOCO 3) e, se o nível novo for folha, o critério de `canExpand`.
 *   O resto do bloco é genérico.
 * -------------------------------------------------------------------------
 */
export function TreeNode(props: TreeNodeProps) {
  // Desestruturação completa (sem `props.` no corpo) para o JSX ficar legível.
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
  // Contexto do colapso (Blocos 1/2) + identidade do container + referência da
  // linha. `domId` existe só para o `aria-controls`; `rowRef`, só para o scroll
  // e a animação de destaque.
  const { isExpanded, toggle, register, unregister, lastAdded } = useTree();
  const domId = useId();
  const rowRef = useRef<HTMLDivElement>(null);

  // `parents` chega como array NOVO a cada render: a chave em string é o que o
  // efeito observa e o ref guarda o valor atual (ver armadilha 1 do header).
  const parentsKey = parents.join('>');
  const parentsRef = useRef(parents);
  parentsRef.current = parents;

  // Dados derivados do nível e do contexto: aparência da linha, se pode
  // expandir e se ESTE nó está aberto agora (o estado real mora no <FormTree>).
  const meta = LEVEL[level];
  const canExpand = level !== 'field';
  const open = isExpanded(id);

  /**
   * Registro/baixa do nó na árvore. Depende só de `id`/`parentsKey` (strings) e
   * das funções do contexto (estáveis): o valor atual de `parents` vem do ref,
   * então o efeito NÃO re-roda a cada render mesmo recebendo array novo.
   * É aqui que o nó nasce aberto e, se for nó novo, dispara a abertura da
   * cadeia de pais.
   */
  useEffect(() => {
    register(id, parentsRef.current);
    return () => unregister(id);
  }, [id, parentsKey, register, unregister]);

  /**
   * Nó recém-adicionado: rola até ele e pisca. `lastAdded` só ganha valor
   * depois da janela de montagem inicial, então a árvore carregada do zero não
   * pisca; a limpeza remove a classe e cancela o timer se o nó sair antes do
   * fim da animação.
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
   * nível expande). O `preventDefault` evita o scroll padrão do Espaço.
   */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (canExpand && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggle(id);
    }
  };

/**
 * =============================================================================
 * BLOCO 5 — <TreeNode>: RENDERIZAÇÃO DA LINHA
 * =============================================================================
 *
 * O QUE FAZ: desenha a linha em TRÊS faixas, nesta ordem:
 *   1. `.tree-toggle` — área clicável: chevron, ícone e rótulo do nível,
 *      o `{name}` e a pill de `count`. É ela que recebe o `onClick` e o teclado
 *      (por isso `role`/`tabIndex`/`aria-*` só existem quando o nível expande).
 *   2. Ações — botão Editar (`onEdit`), botão Adicionar `{addLabel}` (`onAdd`,
 *      com `addDisabled` e `title` explicando o gate) e botão Remover
 *      (`onRemove`). São IRMÃS da área de toggle
 *      (por isso clicar nelas não expande/recolhe a linha) e cada botão só
 *      existe se a prop correspondente for passada.
 *   3. `.tree-children` — container dos filhos, escondido com `.d-none` quando
 *      fechado (NUNCA desmontado — ver BLOCO 2) e só renderizado em nível que
 *      expande.
 *
 * POR QUE ASSIM: a linha é só ESTRUTURA; o conteúdo do nó (o formulário) abre no
 *   MODAL pela prop `onEdit` — colapsar um nó cheio de campos não organiza nada.
 *   Os textos de árvore vazia ("Sem grupos ...") chegam pela PÁGINA, em
 *   `children`, porque cada nível tem uma instrução diferente.
 *
 * COMO REAPROVEITAR: para mudar o visual de um nível, mexa no `LEVEL` (BLOCO 3)
 *   em vez de criar `if (level === ...)` no JSX; para uma ação nova, siga sempre
 *   o par prop opcional -> botão renderizado só quando presente.
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

      {/* Filhos: escondidos com .d-none quando fechado — nunca desmontados. */}
      {canExpand ? (
        <div id={domId} className={`tree-children${open ? '' : ' d-none'}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
