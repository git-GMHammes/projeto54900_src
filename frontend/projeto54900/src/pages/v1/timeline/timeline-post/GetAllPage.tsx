/**
 * =============================================================================
 * FILE HEADER — pages/v1/timeline/timeline-post/GetAllPage.tsx
 * =============================================================================
 *
 * O QUE FAZ: rota `/v1/timeline-post` — LISTA PADRÃO das publicações da
 * Timeline. Wrapper fino de `pages/v1/timeline/StandardListPage.tsx` (motor do
 * Construtor de Listas): a tela inteira é dirigida pelo registro `timeline-post`
 * de `list_manager` (título, endpoint, colunas, ordenação) — nenhum formulário
 * aqui. Antes de 2026-09-28 esta rota de menu apontava para o renderizador
 * genérico `/v1/form/timeline-post`.
 *
 * CONSUMIDORES: `routes/v1/timeline.routes.tsx` (`path: 'timeline-post'`),
 *   item de navbar "Nova Publicação" (`menu_manager.react_route`).
 * =============================================================================
 */

import StandardListPage from '@/pages/v1/timeline/StandardListPage';

export default function TimelinePostGetAllPage() {
  return (
    <StandardListPage
      slug="timeline-post"
      searchPlaceholder="Buscar publicações"
      emptyTitle="Nenhuma publicação encontrada"
      emptyDescription="Nenhuma publicação cadastrada ainda."
    />
  );
}
