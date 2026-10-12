// Lista de categorias de ponto (map-categories) — api/v1/map-categories-view. Wrapper do componente global
// ListBuild (slug 'map-categories'): colunas, ações e busca vêm do banco (list_manager).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="map-categories"
      backFallback={paths.v1.map.explorer}
      createPath={paths.v1.mapAdmin.categories.create}
      createLabel="Nova categoria"
      searchPlaceholder="Buscar por nome, slug ou mapa"
      emptyTitle="Nenhum registro encontrado"
      emptyDescription="Cadastre o primeiro registro de categoria."
    />
  );
}
