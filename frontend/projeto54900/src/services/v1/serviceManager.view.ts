// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre view_service_manager (servico + pai e contadores).
// Espelho de app/Config/Routes/Api/v1/Service/ServiceManager/EndPointView.php, grupo api/v1/service-manager-view.
// Para ESCRITA, ver o arquivo .table.ts correspondente.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const serviceManagerView = createResource(API_GROUPS.serviceManagerView, 'v1', { mutations: false });

export default serviceManagerView;
