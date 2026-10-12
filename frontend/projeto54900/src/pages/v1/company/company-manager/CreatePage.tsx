// Cadastro de empresa — build 'criar-empresa' (form_manager, tabela company_manager).
// Wrapper do componente global RecordFormBuild. Status padrao: Ativa.
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-empresa"
      backPath={paths.v1.companyManager.list}
      defaults={{ status: 'active' }}
      successMessage="Empresa cadastrada."
      fallbackTitle="Nova Empresa"
    />
  );
}
