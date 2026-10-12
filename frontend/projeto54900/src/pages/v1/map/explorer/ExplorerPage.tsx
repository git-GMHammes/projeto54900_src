// Tela /v1/map: explorador do mapa (escolher mapa, ver pontos, buscar endereco/CEP e planejar trajeto).
// Wrapper do componente global MapExplorer — a logica fica la, dirigida por props.
// Voltar: ultima tela visitada; sem historico (aberta direto), vai para a lista de Trajetos.
import MapExplorer from '@/components/map/MapExplorer';
import PageHeader from '@/components/global/PageHeader';
import { useGoBack } from '@/hooks/useGoBack';
import { paths } from '@/routes/paths';

export default function ExplorerPage() {
  const goBack = useGoBack(paths.v1.mapAdmin.routes.list);

  return (
    <>
      <PageHeader
        title="Mapa"
        subtitle="Pontos, endereços, CEP e trajetos com tempo de deslocamento (OpenStreetMap)."
      >
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={goBack}
        >
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />
          Voltar
        </button>
      </PageHeader>
      <MapExplorer />
    </>
  );
}
