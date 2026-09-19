/**
 * =========================================================================
 * FILE HEADER — utils/pagination.ts
 * =========================================================================
 *
 * PROPOSITO: janela de numeros de pagina pro footer padrao de listagens
 * (Bootstrap .pagination/.page-item/.page-link, com a pagina atual
 * destacada). Puro, sem estado React — cada pagina usa seu proprio JSX
 * (paginacao e chrome da pagina, nao do motor list_manager, ver
 * README_render_via_list_constructor.md), so a matematica da janela e
 * compartilhada pra nao duplicar esse calculo.
 *
 *   const totalPages = Math.max(1, Math.ceil(total / params.limit));
 *   paginationWindow(params.page, totalPages) // -> [1, '...', 4, 5, 6, '...', 12]
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido).
 * CONSUMIDORES: toda pagina com footer de paginacao — as GetAllPage de
 * user-manager/menu/nav/upload, ListConstructorPage, ListBuilderPage e
 * FormConstructorListPage.
 *
 * COMO REAPROVEITAR EM OUTRA LISTAGEM: calcular totalPages a partir do
 * total/limit retornados por normalizeList() e passar (page, totalPages)
 * para paginationWindow(); renderizar cada PageToken (numero -> <button>,
 * '...' -> reticencia nao clicavel).
 * -------------------------------------------------------------------------
 */

export type PageToken = number | '...';

/**
 * Sempre inclui a primeira e a última página, mais `delta` páginas pra cada
 * lado da atual; os buracos viram um único token '...' (nunca duas reticências
 * seguidas). Com poucas páginas, devolve a lista cheia sem nenhum '...'.
 */
export function paginationWindow(current: number, totalPages: number, delta = 2): PageToken[] {
  const total = Math.max(1, totalPages);
  const page = Math.min(Math.max(1, current), total);

  if (total <= 1) return [1];

  const pages = new Set<number>([1, total, page]);
  for (let d = 1; d <= delta; d++) {
    if (page - d >= 1) pages.add(page - d);
    if (page + d <= total) pages.add(page + d);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const tokens: PageToken[] = [];
  let anterior = 0;
  for (const p of sorted) {
    if (anterior && p - anterior > 1) tokens.push('...');
    tokens.push(p);
    anterior = p;
  }
  return tokens;
}
