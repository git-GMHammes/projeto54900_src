// Cadastro de parada — build 'criar-parada-trajeto' (form_manager, tabela map_route_stops).
// Wrapper do componente global RecordFormBuild.
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-parada-trajeto"
      backPath={paths.v1.mapAdmin.routeStops.list}
      defaults={{ sort_order: "0", service_time_s: "0" }}
      successMessage="Registro cadastrado."
      fallbackTitle="Nova Parada de Trajeto"
    />
  );
}
