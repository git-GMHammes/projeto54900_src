// Lista de cabeçalhos do template (temp_header) -- api/v1/temp-header. Wrapper do ListBuild
// (slug 'header'). So admin. Cadastro pelo botao "Novo cabeçalho" (build criar-cabecalho).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="header"
      createPath={paths.v1.tempHeader.create}
      createLabel="Novo cabeçalho"
      searchPlaceholder="Buscar por nome ou nome social"
      emptyTitle="Nenhum cabeçalho encontrado"
      emptyDescription="Cadastre o primeiro cabeçalho do template."
    />
  );
}
