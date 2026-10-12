// Edicao de categoria — build 'editar-categoria-mapa' (form_manager, tabela map_categories).
// Wrapper do componente global RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { mapCategoriesTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import { paths } from '@/routes/paths';

const toValues = (record: ApiRow): Record<string, string> => ({
  map_manager_id: toText(record.map_manager_id, ''),
  map_icon_id: toText(record.map_icon_id, ''),
  name: toText(record.name, ''),
  slug: toText(record.slug, ''),
  color: toText(record.color, ''),
  sort_order: toText(record.sort_order, ''),
  status: toText(record.status, ''),
});

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-categoria-mapa"
      backPath={paths.v1.mapAdmin.categories.list}
      recordId={id ?? ''}
      loadRecord={(rid) => mapCategoriesTable.get(rid)}
      toValues={toValues}
      successMessage="Registro atualizado."
      fallbackTitle={`Editar categoria #${id ?? ''}`}
    />
  );
}
