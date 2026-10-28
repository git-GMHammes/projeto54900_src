// Cadastro de cabeçalho do template -- build 'criar-cabecalho' (form_manager, tabela temp_header).
// Sem o campo Empresas, o backend assume a empresa da sessao. O status nasce draft (ativar e uma edicao).
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-cabecalho"
      backPath={paths.v1.tempHeader.list}
      defaults={{ sort_order: '0' }}
      successMessage="Cabeçalho cadastrado."
      fallbackTitle="Novo Cabeçalho"
    />
  );
}
