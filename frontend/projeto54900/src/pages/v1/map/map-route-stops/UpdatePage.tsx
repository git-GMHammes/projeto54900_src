// Edicao de parada — build 'editar-parada-trajeto' (form_manager, tabela map_route_stops).
// Wrapper do componente global RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import FormCenterPicker from '@/components/map/FormCenterPicker';
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { mapRouteStopsTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';
import { paths } from '@/routes/paths';

const toValues = (record: ApiRow): Record<string, string> => ({
  map_route_id: toText(record.map_route_id, ''),
  label: toText(record.label, ''),
  map_point_id: toText(record.map_point_id, ''),
  map_address_id: toText(record.map_address_id, ''),
  lat: toText(record.lat, ''),
  lng: toText(record.lng, ''),
  sort_order: toText(record.sort_order, ''),
  service_time_s: toText(record.service_time_s, ''),
  leg_distance_m: toText(record.leg_distance_m, ''),
  leg_duration_s: toText(record.leg_duration_s, ''),
});

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-parada-trajeto"
      backPath={paths.v1.mapAdmin.routeStops.list}
      recordId={id ?? ''}
      loadRecord={(rid) => mapRouteStopsTable.get(rid)}
      toValues={toValues}
      afterFields={<FormCenterPicker latName="lat" lngName="lng" label="parada" initialZoom={15} />}
      successMessage="Registro atualizado."
      fallbackTitle={`Editar parada #${id ?? ''}`}
    />
  );
}
