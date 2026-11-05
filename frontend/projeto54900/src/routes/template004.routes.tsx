// Rota do Template004 (pública, estática, sem API): variante sem bordas do Template001.
// Fora do RootLayout: o próprio template traz cabeçalho, nav, menu e rodapé, então a
// navbar do app não se repete.
//
// - /template004 -> Template004Page: layout lido de pages/Template004/template004.json.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { paths } from '@/routes/paths';

const Template004Page = lazy(() => import('@/pages/Template004/Template004Page'));

export const template004Routes: RouteObject[] = [{ path: paths.template004, element: <Template004Page /> }];

export default template004Routes;
