// Lista de trajetos (map-routes) — api/v1/map-routes-view. Wrapper do componente global
// ListBuild (slug 'map-routes'): colunas, ações e busca vêm do banco (list_manager).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="map-routes"
      backFallback={paths.v1.map.explorer}
      createPath={paths.v1.map.explorer}
      createLabel="Novo trajeto"
      searchPlaceholder="Buscar por nome ou mapa"
      emptyTitle="Nenhum registro encontrado"
      emptyDescription="Calcule um trajeto no Explorador do mapa."
    />
  );
}
