// Subrotas do modulo ibgeMap (v1). Paths relativos ao pai "v1".
// Rota WEB estatica: nao espelha endpoint da API — a pagina so consome
// arquivos estaticos de public/ibge-map/ (SVG + JSONs dos municipios do RJ).
//
// - /v1/ibge-map -> IbgeMapPage: mapa SVG dos municipios do RJ com tooltip e
//                   checklist sincronizado (origem: CakePHP diarias, Mapa/Page).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const IbgeMapPage = lazy(() => import('@/pages/v1/ibge-map/IbgeMapPage'));

export const ibgeMapRoutes: RouteObject[] = [
  { path: 'ibge-map', element: <IbgeMapPage /> },
];

export default ibgeMapRoutes;
