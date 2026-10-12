// Lista de ícones de marcação (map-icons) — api/v1/map-icons-view. Wrapper do componente global
// ListBuild (slug 'map-icons'): colunas, ações e busca vêm do banco (list_manager).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="map-icons"
      backFallback={paths.v1.map.explorer}
      createPath={paths.v1.mapAdmin.icons.create}
      createLabel="Novo ícone"
      searchPlaceholder="Buscar por nome ou classe"
      emptyTitle="Nenhum registro encontrado"
      emptyDescription="Cadastre o primeiro registro de ícone."
    />
  );
}
