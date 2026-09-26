// Pagina PUBLICA (sem sessao) — destino do link de e-mail do convite de
// evento. Le ?token= da URL e chama POST /calendar-event-invites/accept-token
// uma unica vez ao montar. Sucesso = convidado adicionado (mesmo create() ja
// usado internamente em calendar-event-attendees); a partir dai, aceitar/
// recusar o convite exige login normal (fluxo respond ja existente).
// data.account_created (Modo B, sem cadastro previo) muda a mensagem para
// orientar o convidado a checar o e-mail 2 (usuario/senha) antes de logar.

import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import { http, ApiError } from '@/services/http';
import { paths } from '@/routes/paths';

type Status = 'loading' | 'success' | 'error';

export default function AceitarConvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!token) {
      setStatus('error');
      setMessage('Link de convite invalido: token ausente.');
      return;
    }

    http
      .post<{ data?: { account_created?: boolean } }>('/v1/calendar-event-invites/accept-token', { token })
      .then((result) => {
        setStatus('success');
        // account_created = true so quando o backend criou a conta agora
        // (convidado sem cadastro previo, Modo B) -- ele ainda nao sabe a
        // senha: precisa checar o e-mail 2 (credenciais) antes de logar.
        setMessage(
          result?.data?.account_created
            ? 'Cadastro realizado com sucesso! Enviamos um e-mail com seu usuario e senha — confira sua caixa de entrada (e o spam) para confirmar os dados de acesso antes de fazer login.'
            : 'Convite aceito! Faca login para ver o evento e responder ao convite.',
        );
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof ApiError ? err.message : 'Falha inesperada ao aceitar o convite.');
      });
  }, [token]);

  return (
    <>
      <PageHeader title="Convite de evento" subtitle="POST api/v1/calendar-event-invites/accept-token" />

      {status === 'loading' && <p>Validando convite...</p>}

      {status === 'success' && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}

      {status === 'error' && (
        <div className="alert alert-danger" role="alert">
          {message}
        </div>
      )}

      {status !== 'loading' && (
        <Link to={paths.v1.auth.login} className="btn btn-primary">
          Ir para login
        </Link>
      )}
    </>
  );
}
