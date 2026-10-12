// PROPOSITO: recurso REST da tabela map_addresses (enderecos georreferenciados). Espelho de
// app/Config/Routes/Api/v1/Map/MapAddresses/EndpointTable.php, grupo api/v1/map-addresses
// -> Api\V1\Map\MapAddresses\ResourceTableController.
// Leitura/escrita pelos endpoints padrao; regras de negocio no backend. Para LEITURA da view
// (view_map_addresses), ver mapAddresses.view.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapAddressesTable = createResource(API_GROUPS.mapAddresses, 'v1');

export default mapAddressesTable;
