/**
 * =========================================================================
 * FILE HEADER — services/v1/calendarManager.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST da tabela calendar_manager (a tabela crua — a
 * listagem agrupada com eventos usa calendarManager.view.ts / view_calendar_manager,
 * este arquivo é para operações diretas na tabela, ex.: PUT update para
 * gravar sort_order). Espelho de
 * app/Config/Routes/Api/v1/Calendar/CalendarManager/EndpointTable.php.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.calendarManager).
 * CONSUMIDORES: pages/v1/calendar/calendar-list/GetAllPage.tsx (arrastar para
 * reordenar — PUT update do sort_order de cada calendário movido).
 *
 * COMO REAPROVEITAR: ver calendarEventAttendees.table.ts (mesmo padrão).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instância do recurso — métodos REST padrão sobre calendar_manager. */
export const calendarManagerTable = createResource(API_GROUPS.calendarManager, 'v1');

export default calendarManagerTable;
