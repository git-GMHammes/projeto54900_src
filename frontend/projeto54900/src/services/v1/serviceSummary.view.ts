// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre view_service_summary (resumo por servico (pedidos, faturado, nota media)).
// Espelho de app/Config/Routes/Api/v1/Service/ServiceSummary/EndPointView.php, grupo api/v1/service-summary-view.
// Para ESCRITA, ver o arquivo .table.ts correspondente.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const serviceSummaryView = createResource(API_GROUPS.serviceSummaryView, 'v1', { mutations: false });

export default serviceSummaryView;
