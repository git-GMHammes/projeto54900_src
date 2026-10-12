// Lista de paradas de trajeto (map-route-stops) — api/v1/map-route-stops-view. Wrapper do componente global
// ListBuild (slug 'map-route-stops'): colunas, ações e busca vêm do banco (list_manager).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="map-route-stops"
      backFallback={paths.v1.map.explorer}
      createPath={paths.v1.mapAdmin.routeStops.create}
      createLabel="Nova parada"
      searchPlaceholder="Buscar por rótulo, trajeto ou ponto"
      emptyTitle="Nenhum registro encontrado"
      emptyDescription="Cadastre o primeiro registro de parada."
    />
  );
}
