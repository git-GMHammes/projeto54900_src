// Rota do Template002 (pública, estática, sem API): variante sem bordas do Template001.
// Fora do RootLayout: o próprio template traz cabeçalho, nav, menu e rodapé, então a
// navbar do app não se repete.
//
// - /template002 -> Template002Page: layout lido de pages/Template002/template002.json.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { paths } from '@/routes/paths';

const Template002Page = lazy(() => import('@/pages/Template002/Template002Page'));

export const template002Routes: RouteObject[] = [{ path: paths.template002, element: <Template002Page /> }];

export default template002Routes;
