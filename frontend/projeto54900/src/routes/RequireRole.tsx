// Guard de rota: bloqueia a renderizacao das rotas-filhas para quem nao tem
// o role exigido. Usado DENTRO de um no ja protegido por <RequireAuth/> (ver
// routes/v1/index.tsx) — so checa papel, autenticacao ja esta garantida pelo
// pai; por isso nao trata bootstrapping/isAuthenticated aqui.
//
// user.role null (usuario autenticado sem role atribuido) e tratado como
// "nao autorizado", nao como erro — mesma logica de useSiteMenu.isRoleAllowed.

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { paths } from '@/routes/paths';

export default function RequireRole({ role }: { role: string }) {
  const { user } = useAuth();

  if (user?.role?.slug !== role) return <Navigate to={paths.forbidden} replace />;

  return <Outlet />;
}
