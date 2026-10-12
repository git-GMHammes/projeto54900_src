// Guard de rota: bloqueia a renderizacao das rotas-filhas sem sessao ativa.
// Usado como elemento de um no PAI (sem path proprio) em routes/v1/index.tsx
// e routes/v1a/index.tsx, envolvendo tudo que NAO seja Home, Login ou as duas
// telas de Cadastro de Usuario (as unicas paginas publicas do sistema).
//
// bootstrapping (refresh silencioso inicial do AuthContext) mostra apenas o
// LoadingOverlay — evita "piscar" um redirect para /v1/login antes da sessao
// salva em localStorage ter chance de ser restaurada.

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { paths } from '@/routes/paths';
import { companyBasePath, companySlug, env } from '@/config/env';

export default function RequireAuth() {
  const { isAuthenticated, bootstrapping, user } = useAuth();

  if (bootstrapping) return <LoadingOverlay />;
  if (!isAuthenticated) return <Navigate to={paths.v1.auth.login} replace />;

  // Multiempresa: a URL pos-login e /<slug-empresa>/v1/... e a SESSAO e amarrada a UMA empresa
  // (a do login, user.company_slug). Slug ausente ou diferente do da sessao — inclusive outra
  // empresa do mesmo usuario — volta para a empresa da sessao. O basename do router e fixado na
  // carga (config/env.ts), entao a correcao e navegacao completa. Trocar de empresa = novo login.
  const sessionSlug = user?.company_slug;
  if (sessionSlug && sessionSlug !== companySlug) {
    const base = companySlug ? companyBasePath(companySlug) : env.basePath;
    const rest = window.location.pathname.slice(base.length);
    window.location.replace(`${companyBasePath(sessionSlug)}${rest}${window.location.search}${window.location.hash}`);
    return <LoadingOverlay />;
  }

  return <Outlet />;
}
