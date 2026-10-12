// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_map_categories.
// Espelho de app/Config/Routes/Api/v1/Map/MapCategories/EndPointView.php, grupo api/v1/map-categories-view
// -> Api\V1\Map\MapCategories\ResourceViewController.
// Para ESCRITA no registro, ver mapCategories.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapCategoriesView = createResource(API_GROUPS.mapCategoriesView, 'v1', { mutations: false });

export default mapCategoriesView;
