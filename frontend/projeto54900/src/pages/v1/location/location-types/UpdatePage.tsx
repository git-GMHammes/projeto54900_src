// Edicao de tipo de local -- build 'editar-tipo-de-local' (form_manager, tabela location_types).
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { locationTypesTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import { paths } from '@/routes/paths';

const toValues = (record: ApiRow): Record<string, string> => ({
  code: toText(record.code, ''),
  name: toText(record.name, ''),
  icon: toText(record.icon, ''),
  sort_order: toText(record.sort_order, ''),
  status: toText(record.status, 'active'),
});

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-tipo-de-local"
      backPath={paths.v1.locationTypes.list}
      recordId={id ?? ''}
      loadRecord={(rid) => locationTypesTable.get(rid)}
      toValues={toValues}
      successMessage="Tipo atualizado."
      fallbackTitle={`Editar tipo #${id ?? ''}`}
    />
  );
}
