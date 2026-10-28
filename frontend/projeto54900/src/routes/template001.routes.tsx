// Rota do Template001 (pública, estática, sem API). Fora do RootLayout: o próprio
// template traz cabeçalho, nav, menu e rodapé, então a navbar do app não se repete.
//
// - /template001 -> Template001Page: layout lido de pages/Template001/template001.json.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { paths } from '@/routes/paths';

const Template001Page = lazy(() => import('@/pages/Template001/Template001Page'));

export const template001Routes: RouteObject[] = [{ path: paths.template001, element: <Template001Page /> }];

export default template001Routes;
