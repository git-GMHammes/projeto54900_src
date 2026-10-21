// Cadastro de CEP — build 'criar-cep-mapa' (form_manager, tabela map_postal_codes).
// Wrapper do componente global RecordFormBuild.
import FormCenterPicker from '@/components/map/FormCenterPicker';
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-cep-mapa"
      backPath={paths.v1.mapAdmin.postalCodes.list}
      defaults={{ source: "manual" }}
      afterFields={<FormCenterPicker latName="lat" lngName="lng" label="CEP" initialZoom={15} />}
      successMessage="Registro cadastrado."
      fallbackTitle="Novo CEP"
    />
  );
}
