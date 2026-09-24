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
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre calendar_event_attendees. */
export const calendarEventAttendeesTable = createResource(API_GROUPS.calendarEventAttendees, 'v1');

export default calendarEventAttendeesTable;
