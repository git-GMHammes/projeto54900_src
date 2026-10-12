// Edicao de ponto — build 'editar-ponto-mapa' (form_manager, tabela map_points).
// Wrapper do componente global RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { mapPointsTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import { paths } from '@/routes/paths';

const toValues = (record: ApiRow): Record<string, string> => ({
  map_manager_id: toText(record.map_manager_id, ''),
  map_category_id: toText(record.map_category_id, ''),
  name: toText(record.name, ''),
  status: toText(record.status, ''),
  description: toText(record.description, ''),
  lat: toText(record.lat, ''),
  lng: toText(record.lng, ''),
  map_icon_id: toText(record.map_icon_id, ''),
  map_address_id: toText(record.map_address_id, ''),
  user_manager_id: toText(record.user_manager_id, ''),
});

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-ponto-mapa"
      backPath={paths.v1.mapAdmin.points.list}
      recordId={id ?? ''}
      loadRecord={(rid) => mapPointsTable.get(rid)}
      toValues={toValues}
      successMessage="Registro atualizado."
      fallbackTitle={`Editar ponto #${id ?? ''}`}
    />
  );
}
