// Edicao de trajeto — build 'editar-trajeto-mapa' (form_manager, tabela map_routes).
// Wrapper do componente global RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { mapRoutesTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import { paths } from '@/routes/paths';

const toValues = (record: ApiRow): Record<string, string> => ({
  map_manager_id: toText(record.map_manager_id, ''),
  name: toText(record.name, ''),
  profile: toText(record.profile, ''),
  status: toText(record.status, ''),
  user_manager_id: toText(record.user_manager_id, ''),
});

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-trajeto-mapa"
      backPath={paths.v1.mapAdmin.routes.list}
      recordId={id ?? ''}
      loadRecord={(rid) => mapRoutesTable.get(rid)}
      toValues={toValues}
      successMessage="Registro atualizado."
      fallbackTitle={`Editar trajeto #${id ?? ''}`}
    />
  );
}
