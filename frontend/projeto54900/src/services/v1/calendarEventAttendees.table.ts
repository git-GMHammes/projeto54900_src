/**
 * =========================================================================
 * FILE HEADER — services/v1/calendarEventAttendees.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela calendar_event_attendees — convidados de um evento de
 * calendario (usuario do sistema via user_manager_id, ou e-mail externo).
 * Espelho de app/Config/Routes/Api/v1/Calendar/CalendarEventAttendees/EndpointTable.php,
 * grupo api/v1/calendar-event-attendees -> Api\V1\Calendar\CalendarEventAttendees\ResourceTableController.
 * API propria da tabela filha — nao passa por calendar-events nem pela
 * view_calendar_manager.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.calendarEventAttendees).
 * CONSUMIDORES: pages/v1/calendar/calendar-manager/GetAllPage.tsx (modal
 * "Convidados": lista via find por calendar_event_id e exclui via
 * deleteSoft). Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver listActions.table.ts (mesmo padrao
 * de recurso de tabela via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { http } from '@/services/http';
import { API_GROUPS, DEFAULT_API_VERSION } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre calendar_event_attendees. */
export const calendarEventAttendeesTable = createResource(API_GROUPS.calendarEventAttendees, 'v1');

/**
 * PUT respond/{calendarEventId} — endpoint exclusivo deste modulo (fora do
 * endpoint-set padrao da factory): o proprio usuario logado aceita/recusa o
 * convite do evento informado. Nao recebe id de attendee — o back-end resolve
 * pelo usuario da sessao (CurrentUser::id()), entao so responde ao PROPRIO
 * convite, nunca ao de outra pessoa.
 */
export function respondToEvent(
  calendarEventId: string | number,
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction',
): Promise<unknown> {
  return http.put(`/${DEFAULT_API_VERSION}/${API_GROUPS.calendarEventAttendees}/respond/${calendarEventId}`, {
    response_status: responseStatus,
  });
}

export default calendarEventAttendeesTable;
