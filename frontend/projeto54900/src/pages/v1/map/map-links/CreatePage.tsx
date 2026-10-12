// Cadastro de vínculo — build 'criar-vinculo-mapa' (form_manager, tabela map_links).
// Wrapper do componente global RecordFormBuild.
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-vinculo-mapa"
      backPath={paths.v1.mapAdmin.links.list}
      defaults={{ collection: "default", status: "active", sort_order: "0" }}
      successMessage="Registro cadastrado."
      fallbackTitle="Novo Vínculo com o Mapa"
    />
  );
}
