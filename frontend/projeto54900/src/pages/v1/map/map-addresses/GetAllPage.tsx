// Lista de endereços (map-addresses) — api/v1/map-addresses-view. Wrapper do componente global
// ListBuild (slug 'map-addresses'): colunas, ações e busca vêm do banco (list_manager).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="map-addresses"
      backFallback={paths.v1.map.explorer}
      createPath={paths.v1.mapAdmin.addresses.create}
      createLabel="Novo endereço"
      searchPlaceholder="Buscar por CEP, logradouro, bairro ou cidade"
      emptyTitle="Nenhum registro encontrado"
      emptyDescription="Cadastre o primeiro registro de endereço."
    />
  );
}
