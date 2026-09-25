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

export default function RequireAuth() {
  const { isAuthenticated, bootstrapping } = useAuth();

  if (bootstrapping) return <LoadingOverlay />;
  if (!isAuthenticated) return <Navigate to={paths.v1.auth.login} replace />;

  return <Outlet />;
}
