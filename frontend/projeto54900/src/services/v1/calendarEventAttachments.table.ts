/**
 * =========================================================================
 * FILE HEADER — services/v1/calendarEventAttachments.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela calendar_event_attachments — anexos de um evento de calendario.
 * So guarda a referencia (file_id = id em uploads); o binario sobe antes por
 * uploadManager.upload.ts (module 'calendar_events', reference_id = evento),
 * gravado em writable/uploads/calendar_events/<evento>/.
 * Espelho de app/Config/Routes/Api/v1/Calendar/CalendarEventAttachments/EndpointTable.php,
 * grupo api/v1/calendar-event-attachments -> Api\V1\Calendar\CalendarEventAttachments\ResourceTableController.
 * API propria da tabela filha — nao passa por calendar-events nem pela
 * view_calendar_manager.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.calendarEventAttachments).
 * CONSUMIDORES: pages/v1/calendar/calendar-manager/GetAllPage.tsx (modal
 * "Anexos": lista via find por calendar_event_id, cria apos o upload e
 * exclui via deleteSoft; deleteHard no rollback de envio). Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver calendarEventAttendees.table.ts
 * (mesmo padrao de recurso de tabela filha via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre calendar_event_attachments. */
export const calendarEventAttachmentsTable = createResource(API_GROUPS.calendarEventAttachments, 'v1');

export default calendarEventAttachmentsTable;
