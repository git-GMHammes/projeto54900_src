// Edicao de vínculo — build 'editar-vinculo-mapa' (form_manager, tabela map_links).
// Wrapper do componente global RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { mapLinksTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import { paths } from '@/routes/paths';

const toValues = (record: ApiRow): Record<string, string> => ({
  module: toText(record.module, ''),
  reference_id: toText(record.reference_id, ''),
  collection: toText(record.collection, ''),
  link_type: toText(record.link_type, ''),
  map_postal_code_id: toText(record.map_postal_code_id, ''),
  map_address_id: toText(record.map_address_id, ''),
  map_point_id: toText(record.map_point_id, ''),
  map_route_id: toText(record.map_route_id, ''),
  label: toText(record.label, ''),
  sort_order: toText(record.sort_order, ''),
  status: toText(record.status, ''),
});

// Imutaveis depois de salvos (o Processor do backend os ignora no update).
const PATCHES = { module: { disabled: true }, reference_id: { disabled: true }, link_type: { disabled: true } };

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-vinculo-mapa"
      backPath={paths.v1.mapAdmin.links.list}
      recordId={id ?? ''}
      loadRecord={(rid) => mapLinksTable.get(rid)}
      toValues={toValues}
      patches={PATCHES}
      successMessage="Registro atualizado."
      fallbackTitle={`Editar vínculo #${id ?? ''}`}
    />
  );
}
