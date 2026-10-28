// Lista de templates (temp_manager) -- api/v1/temp-manager. Wrapper do ListBuild (slug 'template').
// So superuser. Cadastro pelo botao "Novo template" (build criar-template).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="template"
      createPath={paths.v1.tempManager.create}
      createLabel="Novo template"
      searchPlaceholder="Buscar por code, nome ou descrição"
      emptyTitle="Nenhum template encontrado"
      emptyDescription="Cadastre o primeiro template."
    />
  );
}
