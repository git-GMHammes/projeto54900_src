// Tela /v1/map/links/:module/:id: mapa de UM registro de qualquer modulo registrado em
// Config/MapLinkables.php (endereco, CEP, ponto e rota vinculados). Wrapper do componente
// global MapLinksPanel; aqui so se le a rota e se valida o parametro.
import { useParams } from 'react-router-dom';

import EmptyState from '@/components/global/EmptyState';
import PageHeader from '@/components/global/PageHeader';
import MapLinksPanel from '@/components/map/MapLinksPanel';
import { useGoBack } from '@/hooks/useGoBack';
import { paths } from '@/routes/paths';

export default function LinksPage() {
  const { module = '', id = '' } = useParams();
  const goBack = useGoBack(paths.v1.map.explorer);

  const valid = /^[a-z0-9-]+$/.test(module) && /^\d+$/.test(id) && Number(id) > 0;

  return (
    <>
      <PageHeader title="Mapa do registro" subtitle={valid ? `${module} #${id}` : undefined}>
        <button type="button" className="btn btn-outline-secondary" onClick={goBack}>
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />
          Voltar
        </button>
      </PageHeader>
      {valid ? (
        <MapLinksPanel module={module} referenceId={id} />
      ) : (
        <EmptyState variant="danger" title="Registro inválido" description="Informe um módulo e um id válidos na URL." />
      )}
    </>
  );
}
