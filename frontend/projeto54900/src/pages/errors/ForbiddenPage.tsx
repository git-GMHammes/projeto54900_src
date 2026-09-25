// Pagina dedicada de Acesso Negado (403) — destino do redirect de
// routes/RequireRole.tsx quando o role do usuario nao bate com o exigido.
// SEM nenhum controle funcional (sem busca, sem botoes de acao): antes disso
// a tela bloqueada ainda renderizava a listagem inteira por baixo da mensagem
// de erro, permitindo interacao indevida.
//
// Contador de visitas (sessionStorage, dura so a aba/sessao do navegador):
// da 3a visita em diante (>2), a conta do PROPRIO usuario autenticado e
// bloqueada via authService.selfBlock() (self-service, sempre usa
// CurrentUser::id() no backend — nunca um id vindo do cliente), seguido de
// logout local e redirect pro login. useRef evita contar 2x por causa do
// StrictMode (efeitos rodam 2x em dev).

import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/v1';
import { paths } from '@/routes/paths';

const HITS_KEY = 'projeto54900.forbidden_hits';
/** Visitas permitidas antes do auto-bloqueio — a 3a (> 2) dispara. */
const MAX_ALLOWED_HITS = 2;

/** Le, incrementa e grava o contador da sessao. sessionStorage indisponivel (modo privado etc.) -> trata como 1a visita, nunca bloqueia por acidente. */
function registerHit(): number {
  try {
    const next = (Number(sessionStorage.getItem(HITS_KEY)) || 0) + 1;
    sessionStorage.setItem(HITS_KEY, String(next));
    return next;
  } catch {
    return 1;
  }
}

export default function ForbiddenPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const hits = registerHit();
    if (hits <= MAX_ALLOWED_HITS) return;

    void (async () => {
      try {
        await authService.selfBlock();
      } catch {
        // best-effort -- mesmo se a chamada falhar, ainda desloga localmente abaixo.
      }
      toast.error('Conta bloqueada por tentativas repetidas de acesso não autorizado.', {
        title: 'Acesso negado',
      });
      await logout();
      void navigate(paths.v1.auth.login, { replace: true });
    })();
  }, [logout, navigate, toast]);

  return (
    <>
      <PageHeader title="Acesso negado" subtitle="Você não tem permissão para acessar esta página" />
      <EmptyState
        variant="danger"
        title="403 — Acesso restrito"
        description="Fale com um administrador se acha que isso é um engano."
      >
        <Link className="btn btn-primary" to={paths.home}>
          Voltar ao início
        </Link>
      </EmptyState>
    </>
  );
}
