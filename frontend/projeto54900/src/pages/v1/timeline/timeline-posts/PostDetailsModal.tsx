/**
 * =============================================================================
 * FILE HEADER — pages/v1/timeline/timeline-posts/PostDetailsModal.tsx
 * =============================================================================
 *
 * O QUE FAZ: modal somente-leitura da ação "Ver" (`list_actions.href_template`
 * = `ver-detalhes`) das listas 'timeline-feed' (`/v1/timeline-posts`) e
 * 'timeline-posts-get-all' (`/v1/timeline-posts-get-all`) — mesma técnica já
 * usada em `StandardListPage.tsx` (`<dl>` com as `list_columns` da própria
 * listagem, renderizadas por `renderCell`), sem endpoint novo: a linha clicada
 * já tem tudo que o modal mostra.
 *
 * COMPARTILHADO (2026-09-28, pedido do usuário): as duas páginas acima
 * importam este MESMO componente — não é uma cópia por tela.
 *
 * DEPENDÊNCIAS: `@/components/global/Modal`, `@/utils/listConstructor`
 *   (`renderCell`, tipos `ListColumnRow`).
 * CONSUMIDORES: `pages/v1/timeline/timeline-posts/GetAllPage.tsx` e
 *   `pages/v1/timeline/timeline-posts-get-all/GetAllPage.tsx`.
 * =============================================================================
 */

import Modal from '@/components/global/Modal';
import { renderCell } from '@/utils/listConstructor';
import type { ListColumnRow } from '@/utils/listConstructor';

export default function PostDetailsModal({
  row,
  columns,
  onClose,
}: {
  /** Linha clicada, ou `null` (modal fechado). */
  row: Record<string, unknown> | null;
  /** `list_columns` já carregadas pela página — mesmas colunas da tabela. */
  columns: ListColumnRow[];
  onClose: () => void;
}) {
  return (
    <Modal open={!!row} title="Detalhes da publicação" onClose={onClose}>
      {row && (
        <dl className="row mb-0">
          {columns.map((c) => (
            <div key={c.id} className="col-12 mb-2">
              <dt className="text-body-secondary small mb-0">{c.label}</dt>
              <dd className="mb-0">{renderCell(c, row)}</dd>
            </div>
          ))}
        </dl>
      )}
    </Modal>
  );
}
