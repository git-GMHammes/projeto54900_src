/**
 * =========================================================================
 * FILE HEADER — services/v1/calendarEventInvites.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST da tabela calendar_event_invites — convite de
 * evento por e-mail com token temporario de uso unico. Espelho de
 * app/Config/Routes/Api/v1/Calendar/CalendarEventInvites/EndpointTable.php,
 * grupo api/v1/calendar-event-invites -> Api\V1\Calendar\CalendarEventInvites\ResourceTableController.
 *
 * `create({ calendar_event_id, user_manager_id })` — convidado ja cadastrado.
 * `create({ calendar_event_id, email })` — convidado sem conta (ou com conta
 * ja existente nesse e-mail, resolvido automaticamente no backend); o
 * accept-token cuida do auto-cadastro quando necessario.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.calendarEventInvites).
 * CONSUMIDORES: pages/v1/calendar/calendar-manager/AttendeesModal.tsx (acao
 * "Convidar por e-mail"). Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR: ver calendarEventAttendees.table.ts (mesmo padrao).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre calendar_event_invites. */
export const calendarEventInvitesTable = createResource(API_GROUPS.calendarEventInvites, 'v1');

export default calendarEventInvitesTable;
