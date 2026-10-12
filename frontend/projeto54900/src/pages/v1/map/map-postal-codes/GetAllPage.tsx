// Lista de ceps (map-postal-codes) — api/v1/map-postal-codes-view. Wrapper do componente global
// ListBuild (slug 'map-postal-codes'): colunas, ações e busca vêm do banco (list_manager).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="map-postal-codes"
      backFallback={paths.v1.map.explorer}
      createPath={paths.v1.mapAdmin.postalCodes.create}
      createLabel="Novo CEP"
      searchPlaceholder="Buscar por CEP, logradouro, bairro ou cidade"
      emptyTitle="Nenhum registro encontrado"
      emptyDescription="Cadastre o primeiro registro de CEP."
    />
  );
}
