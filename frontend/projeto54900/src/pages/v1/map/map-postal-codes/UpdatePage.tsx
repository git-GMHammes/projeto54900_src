// Edicao de CEP — build 'editar-cep-mapa' (form_manager, tabela map_postal_codes).
// Wrapper do componente global RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { mapPostalCodesTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import { paths } from '@/routes/paths';

const toValues = (record: ApiRow): Record<string, string> => ({
  cep: toText(record.cep, ''),
  street: toText(record.street, ''),
  neighborhood: toText(record.neighborhood, ''),
  city: toText(record.city, ''),
  state: toText(record.state, ''),
  ibge_code: toText(record.ibge_code, ''),
  lat: toText(record.lat, ''),
  lng: toText(record.lng, ''),
  source: toText(record.source, ''),
});

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-cep-mapa"
      backPath={paths.v1.mapAdmin.postalCodes.list}
      recordId={id ?? ''}
      loadRecord={(rid) => mapPostalCodesTable.get(rid)}
      toValues={toValues}
      successMessage="Registro atualizado."
      fallbackTitle={`Editar CEP #${id ?? ''}`}
    />
  );
}
