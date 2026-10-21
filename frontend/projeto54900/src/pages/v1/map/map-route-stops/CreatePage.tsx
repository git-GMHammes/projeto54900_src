// Cadastro de parada — build 'criar-parada-trajeto' (form_manager, tabela map_route_stops).
// Wrapper do componente global RecordFormBuild.
import FormCenterPicker from '@/components/map/FormCenterPicker';
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-parada-trajeto"
      backPath={paths.v1.mapAdmin.routeStops.list}
      defaults={{ sort_order: "0", service_time_s: "0" }}
      afterFields={<FormCenterPicker latName="lat" lngName="lng" label="parada" initialZoom={15} />}
      successMessage="Registro cadastrado."
      fallbackTitle="Nova Parada de Trajeto"
    />
  );
}
