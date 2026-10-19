// Lista de caracteristicas de servico (service_attributes) -- api/v1/service-attributes-view. Wrapper do ListBuild (slug 'service-attributes':
// colunas, acoes e busca vem do banco).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="service-attributes"
      createPath={paths.v1.serviceAttributes.create}
      createLabel="Nova característica"
      searchPlaceholder="Buscar por serviço, grupo, campo ou valor"
      emptyTitle="Nenhuma característica encontrada"
      emptyDescription="Cadastre a primeira característica."
    />
  );
}
