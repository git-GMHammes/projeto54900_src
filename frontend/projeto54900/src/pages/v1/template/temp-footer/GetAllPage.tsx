// Lista de rodapés do template (temp_footer) -- api/v1/temp-footer. Wrapper do ListBuild
// (slug 'footer'). So admin. Cadastro pelo botao "Novo rodapé" (build criar-rodape).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="footer"
      createPath={paths.v1.tempFooter.create}
      createLabel="Novo rodapé"
      searchPlaceholder="Buscar por nome ou título das colunas"
      emptyTitle="Nenhum rodapé encontrado"
      emptyDescription="Cadastre o primeiro rodapé do template."
    />
  );
}
