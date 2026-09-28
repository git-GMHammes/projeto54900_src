/**
 * =============================================================================
 * FILE HEADER — pages/v1/timeline/timeline-reaction/GetAllPage.tsx
 * =============================================================================
 *
 * O QUE FAZ: rota `/v1/timeline-reaction` — LISTA PADRÃO das reações
 * (`timeline_post_reactions`, curtir/descurtir). Wrapper fino de
 * `pages/v1/timeline/StandardListPage.tsx` (motor do Construtor de Listas):
 * tudo vem do registro `timeline-reaction` de `list_manager` — nenhum
 * formulário aqui (form próprio em `/v1/form/timeline-reaction`). Criada em
 * 2026-09-28 junto com `timeline-rating`: as 2 tabelas do módulo Timeline que
 * ficaram de fora das 5 listas padrão originais (só eram alimentadas pelos
 * botões Curtir/Avaliar do feed, sem lista/form admin).
 *
 * CONSUMIDORES: `routes/v1/timeline.routes.tsx` (`path: 'timeline-reaction'`),
 *   item de navbar "Curtidas/Descurtidas" (`menu_manager.react_route`).
 * =============================================================================
 */

import StandardListPage from '@/pages/v1/timeline/StandardListPage';

export default function TimelineReactionGetAllPage() {
  return (
    <StandardListPage
      slug="timeline-reaction"
      searchPlaceholder="Buscar reações"
      emptyTitle="Nenhuma reação encontrada"
      emptyDescription="Nenhuma reação cadastrada ainda."
    />
  );
}
