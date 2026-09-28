/**
 * =============================================================================
 * FILE HEADER — pages/v1/timeline/timeline-rating/GetAllPage.tsx
 * =============================================================================
 *
 * O QUE FAZ: rota `/v1/timeline-rating` — LISTA PADRÃO das avaliações
 * (`timeline_post_ratings`, nota 1 a 5). Wrapper fino de
 * `pages/v1/timeline/StandardListPage.tsx` (motor do Construtor de Listas):
 * tudo vem do registro `timeline-rating` de `list_manager` — nenhum
 * formulário aqui (form próprio em `/v1/form/timeline-rating`). Criada em
 * 2026-09-28 junto com `timeline-reaction`: as 2 tabelas do módulo Timeline
 * que ficaram de fora das 5 listas padrão originais (só eram alimentadas
 * pelos botões Curtir/Avaliar do feed, sem lista/form admin).
 *
 * CONSUMIDORES: `routes/v1/timeline.routes.tsx` (`path: 'timeline-rating'`),
 *   item de navbar "Avaliações" (`menu_manager.react_route`).
 * =============================================================================
 */

import StandardListPage from '@/pages/v1/timeline/StandardListPage';

export default function TimelineRatingGetAllPage() {
  return (
    <StandardListPage
      slug="timeline-rating"
      searchPlaceholder="Buscar avaliações"
      emptyTitle="Nenhuma avaliação encontrada"
      emptyDescription="Nenhuma avaliação cadastrada ainda."
    />
  );
}
