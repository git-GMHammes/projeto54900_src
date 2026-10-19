// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre view_service_attributes (atributo + dados do servico).
// Espelho de app/Config/Routes/Api/v1/Service/ServiceAttributes/EndPointView.php, grupo api/v1/service-attributes-view.
// Para ESCRITA, ver o arquivo .table.ts correspondente.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const serviceAttributesView = createResource(API_GROUPS.serviceAttributesView, 'v1', { mutations: false });

export default serviceAttributesView;
