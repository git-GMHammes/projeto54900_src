// Cadastro de template -- build 'criar-template' (form_manager, tabela temp_manager).
// Sem empresas, o template nasce sem nenhuma (o catalogo e global). Status nasce draft.
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-template"
      backPath={paths.v1.tempManager.list}
      successMessage="Template cadastrado."
      fallbackTitle="Novo Template"
    />
  );
}
