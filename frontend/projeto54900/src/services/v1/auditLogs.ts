/**
 * =========================================================================
 * FILE HEADER — services/v1/auditLogs.ts
 * =========================================================================
 *
 * PROPOSITO: consulta do log de auditoria e acesso (tabela audit_logs). Espelho de
 * app/Config/Routes/Api/v1/Audit/EndpointAuditLogs.php, grupo api/v1/audit-logs ->
 * Api\V1\Audit\AuditLogController. Somente leitura e somente admin (jwtauth + adminonly
 * no backend). NAO usa createResource: o controller expoe so `find` e `show/{id}`,
 * nao o endpoint-set padrao.
 *
 * DEPENDENCIAS: services/http, constants/api (API_GROUPS.auditLogs).
 * CONSUMIDORES: pages/v1/audit/audit-logs/GetAllPage.
 * -------------------------------------------------------------------------
 */

import { http } from '@/services/http';
import { API_GROUPS, DEFAULT_API_VERSION } from '@/constants/api';
import type { CallOptions, PaginationInput } from '@/types/api';

const base = `/${DEFAULT_API_VERSION}/${API_GROUPS.auditLogs}`;

export const auditLogsView = {
  /** POST find — filtros no body (user_id, login, event_type, action, resource, ip_origin, date_from, date_to, q...) ?page=&limit=&sort=&order= */
  find: (filters: Record<string, unknown> = {}, pagination: PaginationInput = {}, opts?: CallOptions) =>
    http.post(`${base}/find`, filters, { ...opts, params: pagination }),

  /** GET show/{id} */
  show: (id: string | number, opts?: CallOptions) => http.get(`${base}/show/${id}`, opts),
};

export default auditLogsView;
