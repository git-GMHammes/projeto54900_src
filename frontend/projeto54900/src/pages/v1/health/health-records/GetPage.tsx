// Visualizacao de um prontuario (view_health_records): dados do atendimento, acoes de status (Assinar e Cancelar) e itens do
// prontuario (receitas, exames e sinais vitais). Fluxo: draft -> signed | cancelled; signed -> cancelled. Prontuario assinado ou
// cancelado nao e editado e nao aceita novos itens. Wrapper do RecordDetail.
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import AttachmentsPanel from '@/components/global/AttachmentsPanel';
import StatusActions from '@/components/global/StatusActions';
import type { StatusAction } from '@/components/global/StatusActions';
import { paths } from '@/routes/paths';
import { healthExamsView, healthPrescriptionsView, healthRecordsTable, healthRecordsView, healthVitalsView } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:39:09
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-records\GetPage.tsx
LINHA ALTERADA - linha 22 neste arquivo editado:
Era : import { toText } from '@/utils/format';
Ficou : import { formatCpf, toText } from '@/utils/format';
Motivo: importar os formatadores de CPF/telefone.
*/
import { formatCpf, toText } from '@/utils/format';
import { HEALTH_EXAM_STATUS, HEALTH_RECORD_STATUS, labelOf } from '@/utils/recordLabels';
import type { ApiRow } from '@/types/api';

const load = (id: string) => healthRecordsView.get(id);

const SIGN: StatusAction = {
  key: 'sign',
  label: 'Assinar',
  icon: 'pen',
  variant: 'success',
  payload: { status: 'signed' },
  confirm: 'Assinar o prontuário? Depois de assinado ele não pode mais ser editado.',
};
const CANCEL: StatusAction = {
  key: 'cancel',
  label: 'Cancelar prontuário',
  icon: 'x-circle',
  variant: 'outline-danger',
  payload: { status: 'cancelled' },
  confirm: 'Cancelar este prontuário?',
};

const actionsFor = (row: ApiRow): StatusAction[] => {
  switch (toText(row.status, '')) {
    case 'draft':
      return [SIGN, CANCEL];
    case 'signed':
      return [CANCEL];
    default:
      return [];
  }
};

const rowsOf = (request: Promise<unknown>): Promise<ApiRow[]> =>
  request.then((raw) => normalizeList(raw).rows).catch(() => [] as ApiRow[]);

function RecordExtras({ row, reload }: { row: ApiRow; reload: () => void }) {
  const id = toText(row.id, '');
  const open = toText(row.status, '') === 'draft';
  const actions = useMemo(() => actionsFor(row), [row]);
  const [prescriptions, setPrescriptions] = useState<ApiRow[]>([]);
  const [exams, setExams] = useState<ApiRow[]>([]);
  const [vitals, setVitals] = useState<ApiRow[]>([]);

  useEffect(() => {
    let alive = true;
    void Promise.all([
      rowsOf(healthPrescriptionsView.find({ record_id: id })),
      rowsOf(healthExamsView.find({ record_id: id })),
      rowsOf(healthVitalsView.find({ record_id: id })),
    ]).then(([p, e, v]) => {
      if (!alive) return;
      setPrescriptions(p);
      setExams(e);
      setVitals(v);
    });
    return () => {
      alive = false;
    };
  }, [id, row]);

  return (
    <>
      <StatusActions
        actions={actions}
        successMessage="Prontuário atualizado."
        onApply={async (payload) => {
          await healthRecordsTable.update(id, payload);
          reload();
        }}
      />

      <h2 className="h5 mt-4">Receitas ({prescriptions.length})</h2>
      {prescriptions.length === 0 ? (
        <p className="text-body-secondary">Nenhuma receita.</p>
      ) : (
        <ul className="list-group mb-2">
          {prescriptions.map((item) => (
            <li className="list-group-item" key={toText(item.id, '')}>
              <Link to={paths.v1.healthPrescriptions.view(toText(item.id, ''))}>{toText(item.medication, '')}</Link>
              <span className="text-body-secondary ms-2">{toText(item.dosage, '')} {toText(item.frequency, '')}</span>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <Link className="btn btn-outline-primary btn-sm" to={`${paths.v1.healthPrescriptions.create}?record_id=${id}`}>
          Nova receita
        </Link>
      )}

      <h2 className="h5 mt-4">Exames ({exams.length})</h2>
      {exams.length === 0 ? (
        <p className="text-body-secondary">Nenhum exame.</p>
      ) : (
        <ul className="list-group mb-2">
          {exams.map((item) => (
            <li className="list-group-item" key={toText(item.id, '')}>
              <Link to={paths.v1.healthExams.view(toText(item.id, ''))}>{toText(item.name, '')}</Link>
              <span className="badge text-bg-secondary ms-2">{labelOf(HEALTH_EXAM_STATUS, item.status)}</span>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <Link className="btn btn-outline-primary btn-sm" to={`${paths.v1.healthExams.create}?record_id=${id}`}>
          Novo exame
        </Link>
      )}

      <h2 className="h5 mt-4">Sinais vitais ({vitals.length})</h2>
      {vitals.length === 0 ? (
        <p className="text-body-secondary">Nenhuma medição.</p>
      ) : (
        <ul className="list-group mb-2">
          {vitals.map((item) => (
            <li className="list-group-item" key={toText(item.id, '')}>
              <Link to={paths.v1.healthVitals.view(toText(item.id, ''))}>{toText(item.measured_at, 'Medição')}</Link>
              <span className="text-body-secondary ms-2">PA {toText(item.blood_pressure, '-')} · FC {toText(item.heart_rate, '-')}</span>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <Link className="btn btn-outline-primary btn-sm" to={`${paths.v1.healthVitals.create}?record_id=${id}`}>
          Novos sinais vitais
        </Link>
      )}
      <AttachmentsPanel module="HealthRecords" referenceId={id} canEdit={open} />
    </>
  );
}

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => `Prontuário #${id} — ${toText(row.patient_name, '')}`}
      fallbackTitle={`Prontuário #${id}`}
      subtitle="Prontuário do atendimento: paciente, profissional, OS e itens (receitas, exames, sinais vitais)."
      backPath={paths.v1.healthRecords.list}
      editPath={(row) => (toText(row.status, '') === 'draft' ? paths.v1.healthRecords.update(id) : undefined)}
      fields={[
        { label: 'Paciente', value: (row) => toText(row.patient_name, '') },
        /*
        CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:39:09
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-records\GetPage.tsx
        LINHA ALTERADA - linha 178 neste arquivo editado:
        Era : { label: 'CPF do paciente', value: (row) => toText(row.patient_cpf, '') },
        Ficou : { label: 'CPF do paciente', value: (row) => formatCpf(row.patient_cpf) },
        Motivo: exibir com mascara (o dado no banco continua sem mascara).
        */
        { label: 'CPF do paciente', value: (row) => formatCpf(row.patient_cpf) },
        { label: 'Profissional', value: (row) => toText(row.professional_name, '') },
        { label: 'Conselho', value: (row) => toText(row.professional_registration_label, '') },
        { label: 'Especialidade', value: (row) => toText(row.professional_specialty, '') },
        { label: 'Ordem de serviço', value: (row) => `${toText(row.service_order_code, '')} ${toText(row.service_name, '')}`.trim() },
        { label: 'Agendamento da OS', value: (row) => toText(row.service_order_scheduled_at, '') },
        { label: 'Queixa principal', value: (row) => toText(row.complaint, '') },
        { label: 'Anamnese', value: (row) => toText(row.anamnesis, '') },
        { label: 'Diagnóstico', value: (row) => toText(row.diagnosis, '') },
        { label: 'CID-10', value: (row) => toText(row.cid10, '') },
        { label: 'Conduta', value: (row) => toText(row.conduct, '') },
        { label: 'Observações', value: (row) => toText(row.notes, '') },
        { label: 'Status', value: (row) => labelOf(HEALTH_RECORD_STATUS, row.status) },
        { label: 'Assinado em', value: (row) => toText(row.signed_at, '') },
        { label: 'Criado em', value: (row) => toText(row.created_at, '') },
      ]}
    >
      {(row, reload) => <RecordExtras row={row} reload={reload} />}
    </RecordDetail>
  );
}
