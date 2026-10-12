// Lista de mapas (map-manager) — api/v1/map-manager-view. Wrapper do componente global
// ListBuild (slug 'map-manager'): colunas, ações e busca vêm do banco (list_manager).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="map-manager"
      backFallback={paths.v1.map.explorer}
      createPath={paths.v1.mapAdmin.manager.create}
      createLabel="Novo mapa"
      searchPlaceholder="Buscar por título, slug ou descrição"
      emptyTitle="Nenhum registro encontrado"
      emptyDescription="Cadastre o primeiro registro de mapa."
    />
  );
}
