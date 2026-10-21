// Visualizacao do resumo de um servico (view_service_summary), somente leitura: pedidos (total, abertos,
// concluidos, cancelados, atrasados), faturado, nota media e duracao media, com atalhos para o servico e
// para um novo pedido. Wrapper do RecordDetail (sem Editar).
import { Link, useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import { paths } from '@/routes/paths';
import { serviceSummaryView } from '@/services/v1';
import { toText } from '@/utils/format';
import { PROVIDER_TYPE, labelOf } from '@/utils/recordLabels';

const load = (id: string) => serviceSummaryView.get(id);

const money = (value: unknown): string => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : '';
};

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => toText(row.service_name, '')}
      fallbackTitle={`Resumo do serviço #${id}`}
      subtitle="Pedidos, faturamento e avaliação do serviço."
      backPath={paths.v1.serviceSummary.list}
      fields={[
        { label: 'Código', value: (row) => toText(row.service_code, '') },
        { label: 'Tipo', value: (row) => toText(row.service_type, '') },
        { label: 'Prestador', value: (row) => labelOf(PROVIDER_TYPE, row.provider_type) },
        { label: 'Pedidos (total)', value: (row) => toText(row.orders_total, '') },
        { label: 'Pedidos abertos', value: (row) => toText(row.orders_open, '') },
        { label: 'Pedidos atrasados', value: (row) => toText(row.orders_late, '') },
        { label: 'Pedidos concluídos', value: (row) => toText(row.orders_done, '') },
        { label: 'Pedidos cancelados ou recusados', value: (row) => toText(row.orders_cancelled, '') },
        { label: 'Faturado', value: (row) => money(row.revenue) },
        { label: 'Faturado e pago', value: (row) => money(row.revenue_paid) },
        { label: 'Nota média', value: (row) => (row.avg_rating === null ? '' : money(row.avg_rating)) },
        { label: 'Duração média (min)', value: (row) => (row.avg_duration_minutes === null ? '' : money(row.avg_duration_minutes)) },
        { label: 'Último pedido', value: (row) => toText(row.last_order_at, '') },
      ]}
    >
      {() => (
        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-outline-secondary btn-sm" to={paths.v1.serviceManager.view(id)}>
            Ver serviço
          </Link>
          <Link className="btn btn-outline-primary btn-sm" to={`${paths.v1.serviceOrder.create}?service_id=${id}`}>
            Novo pedido
          </Link>
        </div>
      )}
    </RecordDetail>
  );
}
