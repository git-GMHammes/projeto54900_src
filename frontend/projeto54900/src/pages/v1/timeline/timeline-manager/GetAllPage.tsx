/**
 * =============================================================================
 * FILE HEADER — pages/v1/timeline/timeline-manager/GetAllPage.tsx
 * =============================================================================
 *
 * O QUE FAZ: rota `/v1/timeline-manager` — LISTA PADRÃO das timelines
 * (`timeline_manager`). Wrapper fino de
 * `pages/v1/timeline/StandardListPage.tsx` (motor do Construtor de Listas):
 * tudo vem do registro `timeline-manager` de `list_manager` — nenhum formulário
 * aqui. Antes de 2026-09-28 esta rota de menu apontava para o renderizador
 * genérico `/v1/form/timeline-settings`.
 *
 * CONSUMIDORES: `routes/v1/timeline.routes.tsx` (`path: 'timeline-manager'`),
 *   item de navbar "Minha Timeline" (`menu_manager.react_route`).
 * =============================================================================
 */

import StandardListPage from '@/pages/v1/timeline/StandardListPage';

export default function TimelineManagerGetAllPage() {
  return (
    <StandardListPage
      slug="timeline-manager"
      searchPlaceholder="Buscar timelines"
      emptyTitle="Nenhuma timeline encontrada"
      emptyDescription="Nenhuma timeline criada ainda."
    />
  );
}
