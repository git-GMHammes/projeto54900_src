/**
 * =============================================================================
 * FILE HEADER — pages/v1/timeline/timeline-comment/GetAllPage.tsx
 * =============================================================================
 *
 * O QUE FAZ: rota `/v1/timeline-comment` — LISTA PADRÃO dos comentários
 * (`timeline_post_comments`). Wrapper fino de
 * `pages/v1/timeline/StandardListPage.tsx` (motor do Construtor de Listas):
 * tudo vem do registro `timeline-comment` de `list_manager` — nenhum formulário
 * aqui. Antes de 2026-09-28 esta rota de menu apontava para o renderizador
 * genérico `/v1/form/timeline-comment`.
 *
 * CONSUMIDORES: `routes/v1/timeline.routes.tsx` (`path: 'timeline-comment'`),
 *   item de navbar "Comentar" (`menu_manager.react_route`).
 * =============================================================================
 */

import StandardListPage from '@/pages/v1/timeline/StandardListPage';

export default function TimelineCommentGetAllPage() {
  return (
    <StandardListPage
      slug="timeline-comment"
      searchPlaceholder="Buscar comentários"
      emptyTitle="Nenhum comentário encontrado"
      emptyDescription="Nenhum comentário cadastrado ainda."
    />
  );
}
