// Subrotas do modulo knowledge (v1). Paths relativos ao pai "v1".
// Rota WEB estatica: nao espelha endpoint da API — a pagina so le os .md
// da base de conhecimento embutidos no bundle (services/knowledgeBase.ts).
//
// - /v1/knowledge-base -> KnowledgeBasePage: indice consolidado dos READMEs
//                         (backend + frontend) com um collapse por item.
//
// SOMENTE ADMIN: a base descreve regras e estrutura internas do sistema.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import RequireRole from '@/routes/RequireRole';

const KnowledgeBasePage = lazy(() => import('@/pages/v1/knowledge/KnowledgeBasePage'));

export const knowledgeRoutes: RouteObject[] = [
  {
    element: <RequireRole role="admin" />,
    children: [{ path: 'knowledge-base', element: <KnowledgeBasePage /> }],
  },
];

export default knowledgeRoutes;
