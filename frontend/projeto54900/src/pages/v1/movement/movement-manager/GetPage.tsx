// Visualizacao de um movimento (view_movement_manager): dados, acoes do movimento aberto (StatusActions) e
// movimentos gerados a partir dele. Separacao aberta: Confirmar (gera uma saida) ou Cancelar. Encomenda
// aberta: Receber (gera uma entrada, com lote, validade e custo opcionais) ou Cancelar. Movimento
// finalizado ou cancelado nao muda: sem Editar e sem acoes. Wrapper do RecordDetail.
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import StatusActions from '@/components/global/StatusActions';
import type { StatusAction } from '@/components/global/StatusActions';
import { paths } from '@/routes/paths';
import { movementManagerTable, movementManagerView } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import { MOVEMENT_STATUS, MOVEMENT_TYPE, labelOf } from '@/utils/recordLabels';
import type { ApiRow } from '@/types/api';

const load = (id: string) => movementManagerView.get(id);

const CANCEL: StatusAction = {
  key: 'cancel',
  label: 'Cancelar',
  icon: 'x-circle',
  variant: 'outline-danger',
  payload: { status: 'cancelled' },
  confirm: 'Cancelar este movimento? Ele deixa de contar no saldo.',
};

const actionsFor = (row: ApiRow): StatusAction[] => {
  if (toText(row.status, '') !== 'open') return [];
  if (toText(row.type, '') === 'reservation') {
    return [
      {
        key: 'confirm',
        label: 'Confirmar separação',
        icon: 'check2-circle',
        variant: 'success',
        payload: { status: 'done' },
        confirm: 'Confirmar a separação? Isso gera uma saída de estoque.',
      },
      CANCEL,
    ];
  }
  if (toText(row.type, '') === 'order') {
    return [
      {
        key: 'receive',
        label: 'Receber encomenda',
        icon: 'box-arrow-in-down',
        variant: 'success',
        payload: { status: 'done' },
        confirm: 'Receber a encomenda? Isso gera uma entrada de estoque.',
        fields: [
          { name: 'lot', label: 'Lote (opcional)' },
          { name: 'expires_at', label: 'Validade (opcional)', placeholder: 'AAAA-MM-DD' },
          { name: 'unit_cost', label: 'Custo unitário (opcional)', kind: 'decimal' },
        ],
      },
      CANCEL,
    ];
  }
  return [];
};

function MovementExtras({ row, reload }: { row: ApiRow; reload: () => void }) {
  const id = toText(row.id, '');
  const [generated, setGenerated] = useState<ApiRow[]>([]);
  const actions = useMemo(() => actionsFor(row), [row]);

  useEffect(() => {
    let alive = true;
    movementManagerView
      .find({ origin_id: id })
      .then((raw) => {
        if (alive) setGenerated(normalizeList(raw).rows);
      })
      .catch(() => {
        if (alive) setGenerated([]);
      });
    return () => {
      alive = false;
    };
  }, [id, row]);

  return (
    <>
      <StatusActions
        actions={actions}
        successMessage="Movimento atualizado."
        onApply={async (payload) => {
          await movementManagerTable.update(id, payload);
          reload();
        }}
      />
      {generated.length > 0 ? (
        <>
          <h2 className="h5 mt-4">Movimentos gerados</h2>
          <ul className="list-group mb-4">
            {generated.map((item) => (
              <li className="list-group-item" key={toText(item.id, '')}>
                <Link to={paths.v1.movementManager.view(toText(item.id, ''))}>
                  {labelOf(MOVEMENT_TYPE, item.type)} #{toText(item.id, '')}
                </Link>
                <span className="text-body-secondary small ms-2">
                  {toText(item.quantity, '')} em {toText(item.occurred_at, '')}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => `${labelOf(MOVEMENT_TYPE, row.type)} — ${toText(row.product_name, '')}`}
      fallbackTitle={`Movimento #${id}`}
      subtitle="Movimento de produto: quantidade, usuário, datas e origem."
      backPath={paths.v1.movementManager.list}
      editPath={(row) => (toText(row.status, '') === 'open' ? paths.v1.movementManager.update(id) : undefined)}
      fields={[
        { label: 'Produto', value: (row) => `${toText(row.product_code, '')} ${toText(row.product_name, '')}`.trim() },
        { label: 'Tipo', value: (row) => labelOf(MOVEMENT_TYPE, row.type) },
        { label: 'Status', value: (row) => labelOf(MOVEMENT_STATUS, row.status) },
        { label: 'Quantidade', value: (row) => toText(row.quantity, '') },
        { label: 'Data e hora', value: (row) => toText(row.occurred_at, '') },
        { label: 'Chegada prevista', value: (row) => toText(row.expected_at, '') },
        { label: 'Usuário', value: (row) => toText(row.user_name, '') || toText(row.user_username, '') },
        { label: 'Local', value: (row) => toText(row.location_path_names, '') },
        { label: 'Lote', value: (row) => toText(row.lot, '') },
        { label: 'Validade', value: (row) => toText(row.expires_at, '') },
        { label: 'Custo unitário', value: (row) => toText(row.unit_cost, '') },
        { label: 'Motivo', value: (row) => toText(row.reason, '') },
        { label: 'Referência', value: (row) => toText(row.reference, '') },
        { label: 'Movimento de origem', value: (row) => (toText(row.origin_id, '') ? `#${toText(row.origin_id, '')}` : '') },
        { label: 'Observações', value: (row) => toText(row.notes, '') },
      ]}
    >
      {(row, reload) => <MovementExtras row={row} reload={reload} />}
    </RecordDetail>
  );
}
