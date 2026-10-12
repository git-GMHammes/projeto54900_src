// PROPOSITO: recurso REST da tabela map_postal_codes (base de CEP). Espelho de
// app/Config/Routes/Api/v1/Map/MapPostalCodes/EndpointTable.php, grupo api/v1/map-postal-codes
// -> Api\V1\Map\MapPostalCodes\ResourceTableController.
// Leitura/escrita pelos endpoints padrao; regras de negocio no backend. Para LEITURA da view
// (view_map_postal_codes), ver mapPostalCodes.view.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapPostalCodesTable = createResource(API_GROUPS.mapPostalCodes, 'v1');

export default mapPostalCodesTable;
