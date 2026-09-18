/**
 * =============================================================================
 * FILE HEADER — menu.ts (types) — linhas de nav e de menu (Navbar dinâmico)
 * =============================================================================
 *
 * O QUE FAZ: descreve as DUAS tabelas que alimentam a navegação dinâmica:
 *   `nav_manager`  (a "casca" do app: marca/título, imagem, versão do sistema) e
 *   `menu_manager` (a árvore de itens navegáveis).
 *   São tipos de LEITURA — representam o que a API devolve, e não o que o
 *   construtor de menu envia (esse tem tipos locais em `pages/v1/menu/*`).
 *
 * COMO AS DUAS SE LIGAM: cada item de menu aponta para um nav por
 *   `nav_manager_id` e pode apontar para outro item do MESMO nav por `parent_id`
 *   (submenu). É essa hierarquia que o Navbar monta.
 *
 * DEPENDÊNCIAS: nenhuma — tipos puros, sem import.
 *
 * CONSUMIDORES: `hooks/useSiteMenu.ts` — o hook que busca nav + menu
 *   (`normalizeList<NavManagerItem>` e `normalizeList<MenuManagerItem>`) e monta
 *   a árvore de links consumida pelo Navbar.
 *   NÃO CONFUNDIR: o `MenuTreeNode` (nó da árvore, com `children`) é definido
 *   LOCALMENTE em `pages/v1/menu/GetAllPage.tsx` e NÃO vem deste arquivo — aqui
 *   está a LINHA CRUA da API.
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. `id`, `nav_manager_id`, `parent_id` e `sort_order` aceitam `number | string`
 *      DE PROPÓSITO: a API pode devolver id numérico, e o valor acaba usado em
 *      URL/atributo. Quem COMPARA ids deve normalizar para string antes;
 *   2. os nomes em `snake_case` são o formato da API — não renomear para camelCase;
 *   3. `roles` é anulável POR ITEM: é a lista de papéis que enxergam aquele item,
 *      e `null` significa "sem restrição por papel" (e NÃO "lista vazia");
 *   4. campo opcional no banco aparece aqui como `| null` (e não como `?`)
 *      porque a API MANDA a chave: nulo é VALOR, não ausência de campo;
 *   5. `status` é o mesmo tipo nas duas tabelas: um nav fora do ar esconde também
 *      os itens dele — a decisão de filtrar é do consumidor, não do tipo.
 *
 * COMO REPLICAR PARA OUTRA ÁRVORE (pai + filhos): um tipo para o PAI
 *   (`NavManagerItem`) e outro para o FILHO (`MenuManagerItem`, com a FK do pai e
 *   a auto-referência de `parent_id`), deixando o HOOK montar a árvore.
 * =============================================================================
 */

/**
 * =============================================================================
 * BLOCO 1 — `MenuManagerStatus`: o estado do registro
 * =============================================================================
 *
 * O QUE É: união literal com os três estados que a API usa — `draft` (em
 *   montagem), `active` (em uso) e `inactive` (fora do ar, sem apagar o registro).
 *
 * POR QUE UNIÃO LITERAL (e não `string`): o TypeScript passa a recusar estado
 *   inexistente em tempo de compilação, e o autocompletar lista os válidos.
 *   Os valores têm de bater com o enum do BANCO — acrescentar um estado aqui
 *   exige acrescentá-lo lá, e do outro lado também.
 *
 * É usado pelos DOIS tipos do arquivo: o mesmo enum controla a visibilidade da
 *   casca (nav) e a dos itens de menu.
 * -------------------------------------------------------------------------
 */
export type MenuManagerStatus = 'draft' | 'active' | 'inactive';

/**
 * =============================================================================
 * BLOCO 2 — `NavManagerItem`: UMA LINHA DE NAV (a casca do app)
 * =============================================================================
 *
 * O QUE É: o registro de `nav_manager` usado na navegação — apenas os campos que
 *   o Navbar precisa. O cadastro completo do nav tem outros dados (imagem, ícone,
 *   versão) e vive nas páginas de `pages/v1/nav/*`.
 *
 * CAMPO A CAMPO:
 *   id     -> identificador do nav (`number | string`, ver regra 1 do header);
 *   title  -> nome exibido (marca/título do app);
 *   status -> estado do registro: nav `draft` ou `inactive` não deve aparecer
 *             para o usuário final.
 *
 * QUEM CONSOME: `hooks/useSiteMenu.ts`, que escolhe o nav ativo e carrega o menu
 *   correspondente.
 * -------------------------------------------------------------------------
 */
export interface NavManagerItem {
  id: number | string;
  title: string;
  status: MenuManagerStatus;
}

/**
 * =============================================================================
 * BLOCO 3 — `MenuManagerItem`: UMA LINHA DE MENU (o item navegável)
 * =============================================================================
 *
 * O QUE É: o registro de `menu_manager` como a API devolve — a matéria-prima da
 *   árvore que o Navbar monta.
 *
 * CAMPO A CAMPO:
 *   id             -> identificador do ITEM (não confundir com o do nav);
 *   nav_manager_id -> a qual nav o item pertence (FK). É por ele que o hook
 *                     filtra o menu do nav selecionado;
 *   parent_id      -> item PAI dentro do mesmo nav; `null` = item de PRIMEIRO
 *                     nível (raiz da árvore). É a auto-referência que forma os
 *                     submenus;
 *   title          -> rótulo exibido no link;
 *   react_route    -> rota interna do React a navegar; `null` = item que NÃO
 *                     navega (agrupador/título de seção) — quem monta a árvore
 *                     precisa tratá-lo como não clicável;
 *   roles          -> papéis que podem ver o item; `null` = sem restrição por
 *                     papel (ver regra 3 do header);
 *   sort_order     -> posição entre os irmãos. A ORDENAÇÃO é responsabilidade de
 *                     quem monta a árvore, não da API;
 *   status         -> estado do item: só os visíveis entram na navegação.
 *
 * QUEM CONSOME: `hooks/useSiteMenu.ts`, que agrupa por `parent_id`, ordena por
 *   `sort_order` e converte cada item em link.
 *
 * AO DEPURAR UMA ÁRVORE ERRADA: o primeiro suspeito é `parent_id` apontando para
 *   item de OUTRO nav (a FK não garante que o pai seja do mesmo nav). Cheque isso
 *   antes de mexer na ordenação.
 * -------------------------------------------------------------------------
 */
export interface MenuManagerItem {
  id: number | string;
  nav_manager_id: number | string;
  parent_id: number | string | null;
  title: string;
  react_route: string | null;
  roles: string[] | null;
  sort_order: number | string;
  status: MenuManagerStatus;
}
