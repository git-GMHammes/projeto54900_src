// Lista de resumos por servico (view_service_summary) -- api/v1/service-summary-view. Wrapper do ListBuild (slug 'service-summary':
// colunas, acoes e busca vem do banco).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="service-summary"
      backFallback={paths.v1.serviceManager.list}
      searchPlaceholder="Buscar por código ou nome do serviço"
      emptyTitle="Nenhum serviço"
      emptyDescription="Cadastre serviços e pedidos para ver o resumo."
    />
  );
}
