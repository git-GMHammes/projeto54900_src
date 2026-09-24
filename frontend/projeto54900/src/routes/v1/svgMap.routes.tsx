// Subrotas do modulo svgMap (v1). Paths relativos ao pai "v1".
// Rota WEB estatica: nao espelha endpoint da API — a pagina so consome
// arquivos estaticos de public/svg-map/ (SVG + JSONs dos municipios do RJ).
//
// - /v1/svg-map -> SvgMapPage: mapa SVG dos municipios do RJ com tooltip e
//                   checklist sincronizado (origem: CakePHP diarias, Mapa/Page).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const SvgMapPage = lazy(() => import('@/pages/v1/svg-map/SvgMapPage'));

export const svgMapRoutes: RouteObject[] = [
  { path: 'svg-map', element: <SvgMapPage /> },
];

export default svgMapRoutes;
