// Lista de vínculos com o mapa (map-links) — api/v1/map-links-view. Wrapper do componente global
// ListBuild (slug 'map-links'): colunas, ações e busca vêm do banco (list_manager).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="map-links"
      backFallback={paths.v1.map.explorer}
      createPath={paths.v1.mapAdmin.links.create}
      createLabel="Novo vínculo"
      searchPlaceholder="Buscar por módulo, papel, ponto, rota ou CEP"
      emptyTitle="Nenhum registro encontrado"
      emptyDescription="Cadastre o primeiro registro de vínculo."
    />
  );
}
