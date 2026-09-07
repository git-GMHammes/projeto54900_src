// errorElement do router: captura excecoes de loader/render das rotas.

import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import BlankLayout from '@/layouts/BlankLayout';

export default function RouteErrorPage() {
  const error: unknown = useRouteError();
  const navigate = useNavigate();

  const asRouteResponse = isRouteErrorResponse(error);
  const status = asRouteResponse ? error.status : null;
  const message = asRouteResponse
    ? error.statusText || 'Erro de rota'
    : error instanceof Error
      ? error.message
      : 'Erro inesperado na aplicacao.';

  return (
    <BlankLayout>
      <div className="card shadow-sm">
        <div className="card-body text-center p-4">
          <p className="display-6 mb-1">{status ?? 'Ops'}</p>
          <p className="text-body-secondary">{message}</p>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <button className="btn btn-outline-secondary" onClick={() => void navigate(-1)}>
              Voltar
            </button>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </div>
        </div>
      </div>
    </BlankLayout>
  );
}
