// Edicao de caracteristica de produto -- build 'editar-atributo-de-produto' (form_manager, tabela product_attributes).
// Wrapper do RecordFormWithRoles: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormWithRoles from '@/components/global/RecordFormWithRoles';
import { paths } from '@/routes/paths';
import { productAttributesTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  product_id: toText(record.product_id, ''),
  group_code: toText(record.group_code, ''),
  field_code: toText(record.field_code, ''),
  label: toText(record.label, ''),
  value: toText(record.value, ''),
  unit: toText(record.unit, ''),
  sort_order: toText(record.sort_order, ''),
});

const loadRecord = (id: string) => productAttributesTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormWithRoles
      slug="editar-atributo-de-produto"
      backPath={paths.v1.productAttributes.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Característica atualizada."
      fallbackTitle={`Editar característica #${id ?? ''}`}
    />
  );
}
