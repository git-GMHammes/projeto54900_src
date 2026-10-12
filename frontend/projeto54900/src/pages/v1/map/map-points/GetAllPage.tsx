// Lista de pontos no mapa (map-points) — api/v1/map-points-view. Wrapper do componente global
// ListBuild (slug 'map-points'): colunas, ações e busca vêm do banco (list_manager).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="map-points"
      backFallback={paths.v1.map.explorer}
      createPath={paths.v1.mapAdmin.points.create}
      createLabel="Novo ponto"
      searchPlaceholder="Buscar por nome, categoria ou cidade"
      emptyTitle="Nenhum registro encontrado"
      emptyDescription="Cadastre o primeiro registro de ponto."
    />
  );
}
