/**
 * =============================================================================
 * FILE HEADER — pages/v1/timeline/timeline-report/GetAllPage.tsx
 * =============================================================================
 *
 * O QUE FAZ: rota `/v1/timeline-report` — LISTA PADRÃO das denúncias
 * (`timeline_post_reports`). Wrapper fino de
 * `pages/v1/timeline/StandardListPage.tsx` (motor do Construtor de Listas):
 * tudo vem do registro `timeline-report` de `list_manager` — nenhum formulário
 * aqui. Antes de 2026-09-28 esta rota de menu apontava para o renderizador
 * genérico `/v1/form/timeline-report` (que continua existindo, genérico).
 *
 * CONSUMIDORES: `routes/v1/timeline.routes.tsx` (`path: 'timeline-report'`),
 *   item de navbar "Denunciar" (`menu_manager.react_route`).
 * =============================================================================
 */

import StandardListPage from '@/pages/v1/timeline/StandardListPage';

export default function TimelineReportGetAllPage() {
  return (
    <StandardListPage
      slug="timeline-report"
      searchPlaceholder="Buscar denúncias"
      emptyTitle="Nenhuma denúncia encontrada"
      emptyDescription="Nenhuma denúncia registrada ainda."
    />
  );
}
