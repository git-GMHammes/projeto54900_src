/**
 * =========================================================================
 * FILE HEADER — services/v1/calendarManager.view.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
 * view_calendar_manager — 1 linha por evento (JOIN achatado de
 * calendar_manager + calendar_events, com prefixos cm_/ce_ por tabela de
 * origem; calendario sem evento vem com todo ce_* NULL). Espelho de
 * app/Config/Routes/Api/v1/Calendar/CalendarManager/EndPointView.php, grupo
 * api/v1/calendar-manager-view -> Api\V1\Calendar\CalendarManager\ResourceViewController.
 * Para ESCRITA (criar/editar calendario), ver o form_manager de slug
 * 'calendario' (consumido via formManagerView + FormGrid, mesmo padrao de
 * pages/v1/form/FormRendererPage.tsx).
 *
 * DEPENDENCIAS: services/resourceFactory (createResource, aqui com
 * `{ mutations: false }`) e constants/api (API_GROUPS.calendarManagerView).
 * CONSUMIDORES: pages/v1/calendar/calendar-manager/GetAllPage.tsx (unico
 * consumidor — agrupa as linhas achatadas por calendario via
 * services/calendarSchema.ts). Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRA VIEW SOMENTE LEITURA: chamar
 * `createResource(API_GROUPS.<view>, 'v1', { mutations: false })` — ver
 * tambem formManager.view.ts e userManager.view.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — so metodos de leitura (list/get) sobre view_calendar_manager. */
export const calendarManagerView = createResource(API_GROUPS.calendarManagerView, 'v1', { mutations: false });

export default calendarManagerView;
