// Edicao de ícone — build 'editar-icone-mapa' (form_manager, tabela map_icons).
// Wrapper do componente global RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { mapIconsTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import { paths } from '@/routes/paths';

const toValues = (record: ApiRow): Record<string, string> => ({
  name: toText(record.name, ''),
  icon_type: toText(record.icon_type, ''),
  status: toText(record.status, ''),
  icon_class: toText(record.icon_class, ''),
  color: toText(record.color, ''),
  upload_id: toText(record.upload_id, ''),
  size_w: toText(record.size_w, ''),
  size_h: toText(record.size_h, ''),
  anchor_x: toText(record.anchor_x, ''),
  anchor_y: toText(record.anchor_y, ''),
});

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-icone-mapa"
      backPath={paths.v1.mapAdmin.icons.list}
      recordId={id ?? ''}
      loadRecord={(rid) => mapIconsTable.get(rid)}
      toValues={toValues}
      successMessage="Registro atualizado."
      fallbackTitle={`Editar ícone #${id ?? ''}`}
    />
  );
}
