// Visualizacao de um pedido de servico (view_service_order): dados, acoes do fluxo de status
// (StatusActions: cada acao pede so o que a API exige) e etapas do pedido. Fluxo:
// requested -> quoted -> accepted -> scheduled -> in_progress -> done; cancelled e rejected encerram.
// Pedido concluido aceita avaliacao e pagamento; pedido encerrado nao mostra Editar. Wrapper do RecordDetail.
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import StatusActions from '@/components/global/StatusActions';
import type { StatusAction } from '@/components/global/StatusActions';
import { paths } from '@/routes/paths';
import { serviceOrderTable, serviceOrderView } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import { ORDER_STATUS, PROVIDER_TYPE, labelOf } from '@/utils/recordLabels';
import type { ApiRow } from '@/types/api';

const load = (id: string) => serviceOrderView.get(id);

const CLOSED = new Set(['done', 'cancelled', 'rejected']);

const REASON = { name: 'cancel_reason', label: 'Motivo', kind: 'textarea' as const, required: true };

const QUOTE: StatusAction = {
  key: 'quote',
  label: 'Orçar',
  icon: 'currency-dollar',
  payload: { status: 'quoted' },
  fields: [{ name: 'quoted_price', label: 'Valor orçado', kind: 'decimal', required: true }],
};
const SCHEDULE: StatusAction = {
  key: 'schedule',
  label: 'Agendar',
  icon: 'calendar-event',
  payload: { status: 'scheduled' },
  fields: [{ name: 'scheduled_at', label: 'Data e hora', kind: 'datetime', required: true }],
};
const START: StatusAction = { key: 'start', label: 'Iniciar', icon: 'play-circle', payload: { status: 'in_progress' }, confirm: 'Iniciar a execução do serviço?' };
const CANCEL: StatusAction = {
  key: 'cancel',
  label: 'Cancelar',
  icon: 'x-circle',
  variant: 'outline-danger',
  payload: { status: 'cancelled' },
  fields: [REASON],
};

const actionsFor = (row: ApiRow): StatusAction[] => {
  switch (toText(row.status, '')) {
    case 'requested':
      return [QUOTE, CANCEL];
    case 'quoted':
      return [
        { key: 'accept', label: 'Aceitar orçamento', icon: 'check2-circle', variant: 'success', payload: { status: 'accepted' }, confirm: 'Aceitar o orçamento?' },
        { ...QUOTE, key: 'requote', label: 'Reorçar' },
        { key: 'reject', label: 'Recusar', icon: 'hand-thumbs-down', variant: 'outline-danger', payload: { status: 'rejected' }, fields: [REASON] },
        CANCEL,
      ];
    case 'accepted':
      return [SCHEDULE, START, CANCEL];
    case 'scheduled':
      return [{ ...SCHEDULE, key: 'reschedule', label: 'Reagendar' }, START, CANCEL];
    case 'in_progress':
      return [
        {
          key: 'finish',
          label: 'Concluir',
          icon: 'check-circle',
          variant: 'success',
          payload: { status: 'done' },
          fields: [{ name: 'final_price', label: 'Valor final (vazio = valor orçado)', kind: 'decimal' }],
        },
        CANCEL,
      ];
    case 'done':
      return [
        {
          key: 'rate',
          label: 'Avaliar',
          icon: 'star',
          variant: 'outline-primary',
          payload: {},
          fields: [
            {
              name: 'rating',
              label: 'Nota',
              kind: 'select',
              required: true,
              options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? 'estrela' : 'estrelas'}` })),
            },
            { name: 'feedback', label: 'Comentário', kind: 'textarea' },
          ],
        },
        {
          key: 'pay',
          label: 'Registrar pagamento',
          icon: 'cash-coin',
          variant: 'outline-success',
          payload: {},
          fields: [{ name: 'paid_at', label: 'Pago em', kind: 'datetime', required: true }],
        },
      ];
    default:
      return [];
  }
};

function OrderExtras({ row, reload }: { row: ApiRow; reload: () => void }) {
  const id = toText(row.id, '');
  const [steps, setSteps] = useState<ApiRow[]>([]);
  const actions = useMemo(() => actionsFor(row), [row]);

  useEffect(() => {
    let alive = true;
    serviceOrderView
      .find({ parent_id: id })
      .then((raw) => {
        if (alive) setSteps(normalizeList(raw).rows);
      })
      .catch(() => {
        if (alive) setSteps([]);
      });
    return () => {
      alive = false;
    };
  }, [id, row]);

  return (
    <>
      <StatusActions
        actions={actions}
        successMessage="Pedido atualizado."
        onApply={async (payload) => {
          await serviceOrderTable.update(id, payload);
          reload();
        }}
      />
      <h2 className="h5 mt-4">Etapas do pedido ({steps.length})</h2>
      {steps.length === 0 ? (
        <p className="text-body-secondary">Nenhuma etapa.</p>
      ) : (
        <ul className="list-group mb-3">
          {steps.map((step) => (
            <li className="list-group-item" key={toText(step.id, '')}>
              <Link to={paths.v1.serviceOrder.view(toText(step.id, ''))}>
                {toText(step.code, '') || `Pedido #${toText(step.id, '')}`} — {toText(step.service_name, '')}
              </Link>
              <span className="badge text-bg-secondary ms-2">{labelOf(ORDER_STATUS, step.status)}</span>
            </li>
          ))}
        </ul>
      )}
      <Link
        className="btn btn-outline-primary btn-sm"
        to={`${paths.v1.serviceOrder.create}?service_id=${toText(row.service_id, '')}&parent_id=${id}`}
      >
        Nova etapa
      </Link>
    </>
  );
}

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => `${toText(row.code, '') || `Pedido #${id}`} — ${toText(row.service_name, '')}`}
      fallbackTitle={`Pedido #${id}`}
      subtitle="Pedido de serviço: orçamento, agenda, execução e avaliação."
      backPath={paths.v1.serviceOrder.list}
      editPath={(row) => (CLOSED.has(toText(row.status, '')) ? undefined : paths.v1.serviceOrder.update(id))}
      fields={[
        { label: 'Serviço', value: (row) => `${toText(row.service_code, '')} ${toText(row.service_name, '')}`.trim() },
        { label: 'Status', value: (row) => labelOf(ORDER_STATUS, row.status) },
        { label: 'Prestador', value: (row) => labelOf(PROVIDER_TYPE, row.provider_type) },
        { label: 'Cliente', value: (row) => toText(row.customer_name, '') || toText(row.customer_user_name, '') },
        { label: 'Contato', value: (row) => toText(row.customer_contact, '') },
        { label: 'CPF/CNPJ do cliente', value: (row) => toText(row.customer_document, '') },
        { label: 'Executor', value: (row) => toText(row.executor_name, '') || toText(row.executor_username, '') },
        { label: 'Local de execução', value: (row) => toText(row.place, '') },
        { label: 'Quantidade', value: (row) => `${toText(row.quantity, '')} ${toText(row.billing_unit, '')}`.trim() },
        { label: 'Valor orçado', value: (row) => toText(row.quoted_price, '') },
        { label: 'Valor final', value: (row) => toText(row.final_price, '') },
        { label: 'Solicitado em', value: (row) => toText(row.requested_at, '') },
        { label: 'Agendado para', value: (row) => toText(row.scheduled_at, '') },
        { label: 'Início', value: (row) => toText(row.started_at, '') },
        { label: 'Fim', value: (row) => toText(row.finished_at, '') },
        {
          label: 'Prazo',
          value: (row) => {
            const deadline = toText(row.deadline_at, '');
            return Number(row.is_late) === 1 ? `${deadline} (atrasado)` : deadline;
          },
        },
        { label: 'Duração (min)', value: (row) => toText(row.duration_minutes, '') },
        { label: 'Pago em', value: (row) => toText(row.paid_at, '') },
        { label: 'Nota do cliente', value: (row) => toText(row.rating, '') },
        { label: 'Comentário do cliente', value: (row) => toText(row.feedback, '') },
        { label: 'Motivo do cancelamento', value: (row) => toText(row.cancel_reason, '') },
        { label: 'Observações', value: (row) => toText(row.notes, '') },
      ]}
    >
      {(row, reload) => <OrderExtras row={row} reload={reload} />}
    </RecordDetail>
  );
}
