// Cadastro de mapa — build 'criar-mapa' (form_manager, tabela map_manager).
// Wrapper do componente global RecordFormBuild. Centro padrao: Rio de Janeiro (editavel).
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-mapa"
      backPath={paths.v1.mapAdmin.manager.list}
      defaults={{ center_lat: "-22.906800", center_lng: "-43.172900", status: "active", zoom: "13", min_zoom: "1", max_zoom: "19", tile_url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "&copy; OpenStreetMap contributors" }}
      autoSlug={{ from: 'title', to: 'slug' }}
      successMessage="Registro cadastrado."
      fallbackTitle="Novo Mapa"
    />
  );
}
