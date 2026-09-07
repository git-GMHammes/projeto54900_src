import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { useAppConfig } from '@/context/AppConfigContext';
import PageHeader from '@/components/global/PageHeader';

const CARDS = [
  {
    title: 'Usuarios',
    text: 'CRUD da tabela user_manager e consulta da view.',
    to: paths.v1.user.list,
    api: 'api/v1/user-manager',
  },
  {
    title: 'Uploads',
    text: 'Anexos polimorficos: envio, listagem e download.',
    to: paths.v1.upload.list,
    api: 'api/v1/upload-manager',
  },
];

export default function HomePage() {
  const { appName, apiBaseUrl, apiVersion } = useAppConfig();

  return (
    <>
      <PageHeader
        title={appName}
        subtitle="Integracao MAPA / AGENDA / CHAT — frontend React sobre a API CodeIgniter"
      />

      <div className="alert alert-light border d-flex flex-wrap gap-3 justify-content-between">
        <span>
          API base: <code>{apiBaseUrl}</code>
        </span>
        <span>
          Versao ativa: <code>{apiVersion}</code>
        </span>
      </div>

      <div className="row g-3">
        {CARDS.map((card) => (
          <div className="col-12 col-md-6" key={card.to}>
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h5 card-title">{card.title}</h2>
                <p className="card-text text-body-secondary">{card.text}</p>
                <p className="card-text">
                  <code className="small">{card.api}</code>
                </p>
              </div>
              <div className="card-footer bg-transparent">
                <Link className="btn btn-sm btn-primary" to={card.to}>
                  Abrir
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
