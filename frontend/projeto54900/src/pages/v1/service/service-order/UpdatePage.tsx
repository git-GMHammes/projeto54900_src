// Edicao de pedido de servico -- build 'editar-pedido-de-servico' (form_manager, tabela service_order).
// Wrapper do RecordFormWithRoles: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormWithRoles from '@/components/global/RecordFormWithRoles';
import { paths } from '@/routes/paths';
import { serviceOrderTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  customer_name: toText(record.customer_name, ''),
  customer_contact: toText(record.customer_contact, ''),
  customer_document: toText(record.customer_document, ''),
  customer_user_id: toText(record.customer_user_id, ''),
  executor_user_id: toText(record.executor_user_id, ''),
  place: toText(record.place, ''),
  quantity: toText(record.quantity, ''),
  billing_unit: toText(record.billing_unit, ''),
  quoted_price: toText(record.quoted_price, ''),
  scheduled_at: toText(record.scheduled_at, ''),
  deadline_at: toText(record.deadline_at, ''),
  notes: toText(record.notes, ''),
});

const loadRecord = (id: string) => serviceOrderTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormWithRoles
      slug="editar-pedido-de-servico"
      backPath={paths.v1.serviceOrder.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Pedido atualizado."
      fallbackTitle={`Editar pedido #${id ?? ''}`}
    />
  );
}
