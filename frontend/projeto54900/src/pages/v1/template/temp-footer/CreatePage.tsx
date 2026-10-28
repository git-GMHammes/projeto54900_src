// Cadastro de rodapé do template -- build 'criar-rodape' (form_manager, tabela temp_footer).
// Sem o campo Empresas, o backend assume a empresa da sessao. O status nasce draft (ativar e uma edicao).
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-rodape"
      backPath={paths.v1.tempFooter.list}
      defaults={{ sort_order: '0' }}
      successMessage="Rodapé cadastrado."
      fallbackTitle="Novo Rodapé"
    />
  );
}
