// Cadastro de ícone — build 'criar-icone-mapa' (form_manager, tabela map_icons).
// Wrapper do componente global RecordFormBuild.
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-icone-mapa"
      backPath={paths.v1.mapAdmin.icons.list}
      defaults={{ icon_type: "bootstrap-icon", status: "active", size_w: "32", size_h: "32", anchor_x: "16", anchor_y: "32" }}
      successMessage="Registro cadastrado."
      fallbackTitle="Novo Ícone de Marcação"
    />
  );
}
