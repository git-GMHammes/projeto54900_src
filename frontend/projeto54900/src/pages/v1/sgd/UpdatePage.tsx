// Edicao de documento do SGD — build 'editar-sgd' (form_manager). Wrapper do RecordFormBuild:
// busca o registro por id (api/v1/sgd/get/{id}) e monta o formulario.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { sgdTable } from '@/services/v1';
import { paths } from '@/routes/paths';

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-sgd"
      backPath={paths.v1.sgd.list}
      recordId={id ?? ''}
      loadRecord={(rid) => sgdTable.get(rid)}
      toValues={() => ({})}
      successMessage="Documento atualizado."
      fallbackTitle={`SGD — Editar documento #${id ?? ''}`}
    />
  );
}
