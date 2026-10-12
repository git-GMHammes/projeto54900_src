// Lista de permissoes individuais (user_resource_access) — api/v1/user-resource-access-view.
// Wrapper do componente global ListBuild (slug 'user-resource-access'): colunas, acoes e
// busca vem do banco (list_manager). Cadastro pelo botao "Nova permissão" (CreatePage).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="user-resource-access"
      createPath={paths.v1.userResourceAccess.create}
      createLabel="Nova permissão"
      searchPlaceholder="Buscar por usuário, formulário ou listagem"
      emptyTitle="Nenhuma permissão individual"
      emptyDescription="Sem linhas, vale o perfil (roles) do formulário ou listagem."
    />
  );
}
