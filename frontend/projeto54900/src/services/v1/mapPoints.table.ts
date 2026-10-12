// PROPOSITO: recurso REST da tabela map_points (pontos no mapa). Espelho de
// app/Config/Routes/Api/v1/Map/MapPoints/EndpointTable.php, grupo api/v1/map-points
// -> Api\V1\Map\MapPoints\ResourceTableController.
// Leitura/escrita pelos endpoints padrao; regras de negocio no backend. Para LEITURA da view
// (view_map_points), ver mapPoints.view.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapPointsTable = createResource(API_GROUPS.mapPoints, 'v1');

export default mapPointsTable;
