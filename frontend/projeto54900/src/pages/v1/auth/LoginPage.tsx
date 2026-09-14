// Login. Excecao deliberada a regra "todo formulario via FormGrid"
// (README_render_via_formgrid.md): login nao e uma tabela configuravel pelo
// Construtor, e infraestrutura — 2 campos fixos, Bootstrap puro.

import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { paths } from '@/routes/paths';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }

      setSubmitting(true);
      try {
        await login(username, password);
        toast.success('Login realizado com sucesso.', { title: 'Bem-vindo' });
        void navigate(paths.home);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Falha inesperada ao entrar.';
        toast.error(message, { title: 'Erro ao entrar' });
      } finally {
        setSubmitting(false);
      }
    },
    [login, username, password, toast, navigate],
  );

  return (
    <>
      <PageHeader title="Entrar" subtitle="Acesse com o usuário criado no cadastro" />

      <div className="row justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={(e) => void handleSubmit(e)} noValidate>
                <div className="mb-3">
                  <label htmlFor="login-username" className="form-label">
                    Usuário
                  </label>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    className="form-control"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="login-password" className="form-label">
                    Senha
                  </label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    className="form-control"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-body-secondary mt-3">
            Não tem conta?{' '}
            <Link to={paths.v1.user.register}>Criar conta</Link>
          </p>
        </div>
      </div>
    </>
  );
}
