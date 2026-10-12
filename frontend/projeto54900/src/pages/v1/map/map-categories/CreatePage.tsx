// Cadastro de categoria — build 'criar-categoria-mapa' (form_manager, tabela map_categories).
// Wrapper do componente global RecordFormBuild.
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-categoria-mapa"
      backPath={paths.v1.mapAdmin.categories.list}
      defaults={{ status: "active", sort_order: "0" }}
      autoSlug={{ from: 'name', to: 'slug' }}
      successMessage="Registro cadastrado."
      fallbackTitle="Nova Categoria de Ponto"
    />
  );
}
