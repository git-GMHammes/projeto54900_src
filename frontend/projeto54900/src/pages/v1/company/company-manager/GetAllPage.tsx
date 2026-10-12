// Lista de empresas (company_manager) — api/v1/company-manager-view. Wrapper do componente global
// ListBuild (slug 'company-manager'): colunas, acoes e busca vem do banco (list_manager).
// Cadastro pelo botao "Nova empresa" (CreatePage, build criar-empresa).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="company-manager"
      createPath={paths.v1.companyManager.create}
      createLabel="Nova empresa"
      searchPlaceholder="Buscar por nome, slug ou documento"
      emptyTitle="Nenhuma empresa encontrada"
      emptyDescription="Cadastre a primeira empresa."
    />
  );
}
