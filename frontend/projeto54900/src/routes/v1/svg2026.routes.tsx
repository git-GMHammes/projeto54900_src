// Subrotas do modulo svg2026 (v1). Paths relativos ao pai "v1".
// Rota WEB estatica: nao espelha endpoint da API — a pagina so consome
// arquivos estaticos de public/svg-2026/ (SVG + JSONs dos municipios do RJ).
//
// - /v1/svg-2026 -> Svg2026Page: mapa SVG dos municipios do RJ com tooltip e
//                   checklist sincronizado (origem: CakePHP diarias, Mapa/Page).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Svg2026Page = lazy(() => import('@/pages/v1/svg-2026/Svg2026Page'));

export const svg2026Routes: RouteObject[] = [
  { path: 'svg-2026', element: <Svg2026Page /> },
];

export default svg2026Routes;
