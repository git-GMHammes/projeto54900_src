// PROPOSITO: recurso REST da tabela map_links (vinculo universal modulo <-> mapa). Espelho de
// app/Config/Routes/Api/v1/Map/MapLinks/EndpointTable.php, grupo api/v1/map-links
// -> Api\V1\Map\MapLinks\ResourceTableController.
// Leitura/escrita pelos endpoints padrao; regras de negocio no backend. Para LEITURA da view
// (view_map_links), ver mapLinks.view.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapLinksTable = createResource(API_GROUPS.mapLinks, 'v1');

export default mapLinksTable;
