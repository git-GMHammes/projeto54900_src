// PROPOSITO: recurso REST da tabela map_icons (icones de marcacao). Espelho de
// app/Config/Routes/Api/v1/Map/MapIcons/EndpointTable.php, grupo api/v1/map-icons
// -> Api\V1\Map\MapIcons\ResourceTableController.
// Leitura/escrita pelos endpoints padrao; regras de negocio no backend. Para LEITURA da view
// (view_map_icons), ver mapIcons.view.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapIconsTable = createResource(API_GROUPS.mapIcons, 'v1');

export default mapIconsTable;
