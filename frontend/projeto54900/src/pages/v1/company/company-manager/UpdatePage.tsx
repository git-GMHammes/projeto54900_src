// Edicao de empresa — build 'editar-empresa' (form_manager, tabela company_manager).
// Wrapper do componente global RecordFormBuild: busca a empresa por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { companyManagerTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import { paths } from '@/routes/paths';

const toValues = (record: ApiRow): Record<string, string> => ({
  name: toText(record.name, ''),
  slug: toText(record.slug, ''),
  document: toText(record.document, ''),
  color_theme: toText(record.color_theme, ''),
  status: toText(record.status, 'active'),
});

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-empresa"
      backPath={paths.v1.companyManager.list}
      recordId={id ?? ''}
      loadRecord={(rid) => companyManagerTable.get(rid)}
      toValues={toValues}
      successMessage="Empresa atualizada."
      fallbackTitle={`Editar empresa #${id ?? ''}`}
    />
  );
}
