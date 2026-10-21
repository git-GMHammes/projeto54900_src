// Lista de pedidos de servico (service_order) -- api/v1/service-order-view. Wrapper do ListBuild (slug 'service-order':
// colunas, acoes e busca vem do banco).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="service-order"
      createPath={paths.v1.serviceOrder.create}
      createLabel="Novo pedido"
      searchPlaceholder="Buscar por código, cliente, serviço ou executor"
      emptyTitle="Nenhum pedido encontrado"
      emptyDescription="Registre o primeiro pedido."
    />
  );
}
