// Edicao de movimento -- build 'editar-movimento' (form_manager, tabela movement_manager).
// Wrapper do RecordFormWithRoles: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormWithRoles from '@/components/global/RecordFormWithRoles';
import { paths } from '@/routes/paths';
import { movementManagerTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  quantity: toText(record.quantity, ''),
  expected_at: toText(record.expected_at, ''),
  location_id: toText(record.location_id, ''),
  lot: toText(record.lot, ''),
  expires_at: toText(record.expires_at, ''),
  unit_cost: toText(record.unit_cost, ''),
  reason: toText(record.reason, ''),
  reference: toText(record.reference, ''),
  notes: toText(record.notes, ''),
});

const loadRecord = (id: string) => movementManagerTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormWithRoles
      slug="editar-movimento"
      backPath={paths.v1.movementManager.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Movimento atualizado."
      fallbackTitle={`Editar movimento #${id ?? ''}`}
    />
  );
}
