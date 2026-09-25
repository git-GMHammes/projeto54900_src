import { Fragment } from 'react';
import type { ReactNode } from 'react';

import EmptyState from '@/components/global/EmptyState';
import Modal from '@/components/global/Modal';
import type { CalendarEventRow, CalendarGroup } from '@/services/calendarSchema';
import { renderCell } from '@/utils/listConstructor';
import type { ListColumnRow } from '@/utils/listConstructor';

/**
 * Modal "Ver eventos" — tabela (desktop) / cards (mobile) dirigida por
 * list_columns (slug 'calendar-events-view'), dado já carregado (sem nova
 * chamada). `renderEventActions` é a mesma função usada pelos cards da
 * agenda (AgendaViewer) — evita duplicar o fetch de myResponses/eventActions.
 */
export default function ViewEventsModal({
  group,
  eventColumns,
  renderEventActions,
  onOpenEventModal,
  onClose,
}: {
  group: CalendarGroup | null;
  eventColumns: ListColumnRow[];
  renderEventActions: (ev: CalendarEventRow, onOpenModal: (slug: string) => void) => ReactNode;
  onOpenEventModal: (slug: string, event: CalendarEventRow, group: CalendarGroup) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!group}
      title={group ? `Eventos — ${group.calendar.summary}` : 'Eventos'}
      onClose={onClose}
      size="lg"
    >
      {group?.events.length === 0 && (
        <EmptyState
          variant="warning"
          title="Nenhum evento"
          description="Este calendario ainda nao tem eventos. Use 'Criar evento'."
        />
      )}

      {group && group.events.length > 0 && (() => {
        const rows = group.events.map((ev) => ({
          id: ev.id,
          row: {
            ...ev,
            displayStart: ev.startDatetime ?? ev.startDate ?? '',
            displayEnd: ev.endDatetime ?? ev.endDate ?? '',
          },
        }));
        const actionsFor = (row: Record<string, unknown>) => {
          const ev = group.events.find((e) => e.id === row.id);
          if (!ev) return null;
          return renderEventActions(ev, (slug) => onOpenEventModal(slug, ev, group));
        };
        const [titleColumn, ...detailColumns] = eventColumns;

        return (
          <>
            {/* Desktop (md+): tabela. */}
            <div className="table-responsive d-none d-md-block">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead>
                  <tr>
                    {eventColumns.map((c) => (
                      <th key={c.id}>{c.label}</th>
                    ))}
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ id, row }) => (
                    <tr key={id}>
                      {eventColumns.map((c) => (
                        <td key={c.id}>{renderCell(c, row)}</td>
                      ))}
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">{actionsFor(row)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile (< md): 1 card por evento — 1a coluna vira título, demais viram rótulo/valor. */}
            <div className="d-md-none d-flex flex-column gap-2">
              {rows.map(({ id, row }) => (
                <div className="card shadow-sm" key={id}>
                  <div className="card-body p-3">
                    {titleColumn && <div className="fw-semibold mb-2">{renderCell(titleColumn, row)}</div>}
                    <dl className="row small mb-0">
                      {detailColumns.map((c) => (
                        <Fragment key={c.id}>
                          <dt className="col-4 fw-normal text-body-secondary">{c.label}</dt>
                          <dd className="col-8 mb-1">{renderCell(c, row)}</dd>
                        </Fragment>
                      ))}
                    </dl>
                  </div>
                  <div className="card-footer bg-transparent d-flex justify-content-end gap-1 py-2">
                    {actionsFor(row)}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      })()}
    </Modal>
  );
}
