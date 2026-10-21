// Edicao de local -- build 'editar-local' (form_manager, tabela location_manager).
// Wrapper do RecordFormBuild: busca o local por id e preenche o form (pai vazio = topo da arvore).
import { useParams } from 'react-router-dom';

import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import { paths } from '@/routes/paths';
import LocationForm from './LocationForm';

const toValues = (record: ApiRow): Record<string, string> => ({
  name: toText(record.name, ''),
  code: toText(record.code, ''),
  location_type_id: toText(record.location_type_id, ''),
  parent_id: toText(record.parent_id, ''),
  latitude: toText(record.latitude, ''),
  longitude: toText(record.longitude, ''),
  description: toText(record.description, ''),
  sort_order: toText(record.sort_order, ''),
  status: toText(record.status, 'active'),
});

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <LocationForm
      slug="editar-local"
      backPath={paths.v1.locationManager.list}
      recordId={id ?? ''}
      toValues={toValues}
      successMessage="Local atualizado."
      fallbackTitle={`Editar local #${id ?? ''}`}
    />
  );
}
