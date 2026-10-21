// Cadastro de tipo de local -- build 'criar-tipo-de-local' (form_manager, tabela location_types).
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-tipo-de-local"
      backPath={paths.v1.locationTypes.list}
      defaults={{ status: 'active' }}
      successMessage="Tipo cadastrado."
      fallbackTitle="Novo Tipo de Local"
    />
  );
}
