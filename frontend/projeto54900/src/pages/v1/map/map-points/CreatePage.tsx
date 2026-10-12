// Cadastro de ponto — build 'criar-ponto-mapa' (form_manager, tabela map_points).
// Wrapper do componente global RecordFormBuild.
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-ponto-mapa"
      backPath={paths.v1.mapAdmin.points.list}
      defaults={{ status: "active" }}
      successMessage="Registro cadastrado."
      fallbackTitle="Novo Ponto no Mapa"
    />
  );
}
