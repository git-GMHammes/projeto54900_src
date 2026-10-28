// Layout global do sistema (substitui o RootLayout): a casca do template em volta das rotas.
//   - visitante: variante, cabecalho(s) e rodape(s) da empresa do slug da URL (rota publica template-public/get/{slug})
//     ou, sem ela, a variante do env (VITE_GUEST_TEMPLATE, padrao template001) e o rodape simples; nav so com Home e Entrar;
//   - com sessao: o template do usuario (user_manager.temp_manager_id) ou o de menor id ativo da empresa,
//     com nav, menu lateral, cabecalhos e rodapes vindos de template-render/get (hooks/useTemplate).
// Todas as cores vem da paleta do env, antes e depois do login. O RootLayout fica no codigo, sem uso.

import { Outlet, ScrollRestoration } from 'react-router-dom';

import LoadingOverlay from '@/components/global/LoadingOverlay';
import TemplateShell from '@/components/template/TemplateShell';
import { resolveVariant } from '@/components/template/templateVariants';
import { env } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useGuestTemplate } from '@/hooks/useGuestTemplate';
import { useTemplate } from '@/hooks/useTemplate';

export default function TemplateLayout() {
  const { isAuthenticated } = useAuth();
  const { data, loading } = useTemplate();
  const guest = useGuestTemplate(!isAuthenticated);

  // Aguarda o template da sessao (evita montar a variante do visitante e trocar logo em seguida).
  if (isAuthenticated && loading && data === null) return <LoadingOverlay />;
  if (!isAuthenticated && guest.loading) return <LoadingOverlay />;

  // Visitante: variante, cabecalho(s) e rodape(s) da empresa do slug da URL (rota publica); sem ela, a do env.
  // Logado: tudo do template da sessao.
  const guestCode = guest.data?.template?.code ?? env.guestTemplate;
  const variant = resolveVariant(isAuthenticated ? (data?.template?.code ?? guestCode) : guestCode);

  return (
    <>
      <TemplateShell key={`${isAuthenticated ? 'auth' : 'guest'}-${variant.code}`} variant={variant} data={isAuthenticated ? data : guest.data}>
        <Outlet />
      </TemplateShell>
      <ScrollRestoration />
    </>
  );
}
