// Cadastro de endereço — build 'criar-endereco-mapa' (form_manager, tabela map_addresses).
// Wrapper do componente global RecordFormBuild.
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-endereco-mapa"
      backPath={paths.v1.mapAdmin.addresses.list}
      defaults={{ country: "BR", geocode_source: "manual" }}
      successMessage="Registro cadastrado."
      fallbackTitle="Novo Endereço"
    />
  );
}
