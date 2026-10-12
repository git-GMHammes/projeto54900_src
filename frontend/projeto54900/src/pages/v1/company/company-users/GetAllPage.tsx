// Lista de usuarios por empresa — api/v1/company-users-companies-view (usuario + contagem e
// nomes das empresas em que e membro ativo). Wrapper do componente global ListBuild
// (slug 'company-users'). Somente leitura.
import ListBuild from '@/components/global/ListBuild';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="company-users"
      searchPlaceholder="Buscar por usuário, nome, e-mail ou empresa"
      emptyTitle="Nenhum usuário encontrado"
      emptyDescription="Não há usuários para listar."
    />
  );
}
