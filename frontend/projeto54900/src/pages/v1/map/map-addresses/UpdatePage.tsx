// Edicao de endereço — build 'editar-endereco-mapa' (form_manager, tabela map_addresses).
// Wrapper do componente global RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { mapAddressesTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import { paths } from '@/routes/paths';

const toValues = (record: ApiRow): Record<string, string> => ({
  map_postal_code_id: toText(record.map_postal_code_id, ''),
  cep: toText(record.cep, ''),
  country: toText(record.country, ''),
  street: toText(record.street, ''),
  number: toText(record.number, ''),
  complement: toText(record.complement, ''),
  neighborhood: toText(record.neighborhood, ''),
  city: toText(record.city, ''),
  state: toText(record.state, ''),
  lat: toText(record.lat, ''),
  lng: toText(record.lng, ''),
  geocode_source: toText(record.geocode_source, ''),
  geocode_precision: toText(record.geocode_precision, ''),
  display_name: toText(record.display_name, ''),
  osm_type: toText(record.osm_type, ''),
  osm_id: toText(record.osm_id, ''),
});

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-endereco-mapa"
      backPath={paths.v1.mapAdmin.addresses.list}
      recordId={id ?? ''}
      loadRecord={(rid) => mapAddressesTable.get(rid)}
      toValues={toValues}
      successMessage="Registro atualizado."
      fallbackTitle={`Editar endereço #${id ?? ''}`}
    />
  );
}
