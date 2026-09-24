/**
 * =========================================================================
 * FILE HEADER — services/v1/calendarEventReminders.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela calendar_event_reminders — lembretes de um evento de calendario
 * (method email/popup + minutes de antecedencia). So grava a configuracao:
 * ainda nao ha agendador que dispare o aviso.
 * Espelho de app/Config/Routes/Api/v1/Calendar/CalendarEventReminders/EndpointTable.php,
 * grupo api/v1/calendar-event-reminders -> Api\V1\Calendar\CalendarEventReminders\ResourceTableController.
 * API propria da tabela filha — nao passa por calendar-events nem pela
 * view_calendar_manager.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.calendarEventReminders).
 * CONSUMIDORES: pages/v1/calendar/calendar-manager/GetAllPage.tsx (modal
 * "Lembretes": lista via find por calendar_event_id e exclui via
 * deleteSoft). Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver calendarEventAttendees.table.ts
 * (mesmo padrao de recurso de tabela filha via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre calendar_event_reminders. */
export const calendarEventRemindersTable = createResource(API_GROUPS.calendarEventReminders, 'v1');

export default calendarEventRemindersTable;
