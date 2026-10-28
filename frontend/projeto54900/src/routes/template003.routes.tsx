// Rota do Template003 (pública, estática, sem API): variante sem bordas e sem menu lateral fixo (menu em Offcanvas).
// Fora do RootLayout: o próprio template traz cabeçalho, nav, menu e rodapé, então a
// navbar do app não se repete.
//
// - /template003 -> Template003Page: layout lido de pages/Template003/template003.json.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { paths } from '@/routes/paths';

const Template003Page = lazy(() => import('@/pages/Template003/Template003Page'));

export const template003Routes: RouteObject[] = [{ path: paths.template003, element: <Template003Page /> }];

export default template003Routes;
