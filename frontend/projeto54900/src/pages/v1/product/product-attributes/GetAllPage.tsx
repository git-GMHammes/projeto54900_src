// Lista de caracteristicas de produto (product_attributes) -- api/v1/product-attributes-view. Wrapper do ListBuild (slug 'product-attributes':
// colunas, acoes e busca vem do banco).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="product-attributes"
      createPath={paths.v1.productAttributes.create}
      createLabel="Nova característica"
      searchPlaceholder="Buscar por produto, grupo, campo ou valor"
      emptyTitle="Nenhuma característica encontrada"
      emptyDescription="Cadastre a primeira característica."
    />
  );
}
