// Visualizacao do saldo de um produto (view_movement_stock), somente leitura: saldo, reservado,
// encomendado, disponivel e alerta de abaixo do minimo, com atalhos para o produto e para registrar um
// movimento. Wrapper do RecordDetail (sem Editar).
import { Link, useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import { paths } from '@/routes/paths';
import { movementStockView } from '@/services/v1';
import { toText } from '@/utils/format';

const load = (id: string) => movementStockView.get(id);

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => toText(row.product_name, '')}
      fallbackTitle={`Saldo do produto #${id}`}
      subtitle="Saldo calculado dos movimentos finalizados."
      backPath={paths.v1.movementStock.list}
      fields={[
        { label: 'Código', value: (row) => toText(row.product_code, '') },
        { label: 'Saldo', value: (row) => toText(row.on_hand, '') },
        { label: 'Reservado (separações abertas)', value: (row) => toText(row.reserved, '') },
        { label: 'Encomendado (encomendas abertas)', value: (row) => toText(row.ordered, '') },
        { label: 'Disponível', value: (row) => toText(row.available, '') },
        { label: 'Estoque mínimo', value: (row) => toText(row.stock_min, '') },
        { label: 'Estoque máximo', value: (row) => toText(row.stock_max, '') },
        { label: 'Abaixo do mínimo', value: (row) => (Number(row.below_min) === 1 ? 'Sim' : 'Não') },
        { label: 'Entradas', value: (row) => toText(row.entries, '') },
        { label: 'Saídas', value: (row) => toText(row.exits, '') },
        { label: 'Desperdícios', value: (row) => toText(row.wastes, '') },
        { label: 'Próxima chegada prevista', value: (row) => toText(row.next_expected_at, '') },
        { label: 'Último movimento', value: (row) => toText(row.last_movement_at, '') },
      ]}
    >
      {() => (
        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-outline-secondary btn-sm" to={paths.v1.productManager.view(id)}>
            Ver produto
          </Link>
          <Link className="btn btn-outline-primary btn-sm" to={`${paths.v1.movementManager.create}?product_id=${id}`}>
            Registrar movimento
          </Link>
        </div>
      )}
    </RecordDetail>
  );
}
