// PROPOSITO: recurso REST da tabela map_categories (categorias de ponto). Espelho de
// app/Config/Routes/Api/v1/Map/MapCategories/EndpointTable.php, grupo api/v1/map-categories
// -> Api\V1\Map\MapCategories\ResourceTableController.
// Leitura/escrita pelos endpoints padrao; regras de negocio no backend. Para LEITURA da view
// (view_map_categories), ver mapCategories.view.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapCategoriesTable = createResource(API_GROUPS.mapCategories, 'v1');

export default mapCategoriesTable;
