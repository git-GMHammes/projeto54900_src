// Edicao de caracteristica de servico -- build 'editar-atributo-de-servico' (form_manager, tabela service_attributes).
// Wrapper do RecordFormWithRoles: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormWithRoles from '@/components/global/RecordFormWithRoles';
import { paths } from '@/routes/paths';
import { serviceAttributesTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  service_id: toText(record.service_id, ''),
  group_code: toText(record.group_code, ''),
  field_code: toText(record.field_code, ''),
  label: toText(record.label, ''),
  value: toText(record.value, ''),
  unit: toText(record.unit, ''),
  sort_order: toText(record.sort_order, ''),
});

const loadRecord = (id: string) => serviceAttributesTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormWithRoles
      slug="editar-atributo-de-servico"
      backPath={paths.v1.serviceAttributes.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Característica atualizada."
      fallbackTitle={`Editar característica #${id ?? ''}`}
    />
  );
}
