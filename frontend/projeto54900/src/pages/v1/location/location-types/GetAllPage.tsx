// Lista de tipos de local (location_types) -- api/v1/location-types. Wrapper do ListBuild
// (slug 'location-types'). So admin. Cadastro pelo botao "Novo tipo" (build criar-tipo-de-local).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="location-types"
      createPath={paths.v1.locationTypes.create}
      createLabel="Novo tipo"
      searchPlaceholder="Buscar por nome ou código"
      emptyTitle="Nenhum tipo encontrado"
      emptyDescription="Cadastre o primeiro tipo de local."
    />
  );
}
