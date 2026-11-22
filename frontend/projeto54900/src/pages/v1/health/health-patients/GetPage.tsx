// Visualizacao de um paciente (view_health_patients): dados completos, prontuarios e alergias do paciente, com atalhos para
// cadastrar um novo prontuario ou uma nova alergia ja com o paciente escolhido. Wrapper do RecordDetail.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import { paths } from '@/routes/paths';
import { healthAllergiesView, healthPatientsView, healthRecordsView } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:39:09
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-patients\GetPage.tsx
LINHA ALTERADA - linha 18 neste arquivo editado:
Era : import { toText } from '@/utils/format';
Ficou : import { formatCpf, formatPhone, toText } from '@/utils/format';
Motivo: importar os formatadores de CPF/telefone.
*/
import { formatCpf, formatPhone, toText } from '@/utils/format';
import { HEALTH_BLOOD_TYPE, HEALTH_PATIENT_STATUS, HEALTH_RECORD_STATUS, HEALTH_SEVERITY, HEALTH_SEX, labelOf } from '@/utils/recordLabels';
import type { ApiRow } from '@/types/api';

const load = (id: string) => healthPatientsView.get(id);

const rowsOf = (request: Promise<unknown>): Promise<ApiRow[]> =>
  request.then((raw) => normalizeList(raw).rows).catch(() => [] as ApiRow[]);

function PatientExtras({ row }: { row: ApiRow }) {
  const id = toText(row.id, '');
  const [records, setRecords] = useState<ApiRow[]>([]);
  const [allergies, setAllergies] = useState<ApiRow[]>([]);

  useEffect(() => {
    let alive = true;
    void Promise.all([rowsOf(healthRecordsView.find({ patient_id: id })), rowsOf(healthAllergiesView.find({ patient_id: id }))]).then(([r, a]) => {
      if (!alive) return;
      setRecords(r);
      setAllergies(a);
    });
    return () => {
      alive = false;
    };
  }, [id, row]);

  return (
    <>
      <h2 className="h5 mt-4">Prontuários ({records.length})</h2>
      {records.length === 0 ? (
        <p className="text-body-secondary">Nenhum prontuário.</p>
      ) : (
        <ul className="list-group mb-2">
          {records.map((item) => (
            <li className="list-group-item" key={toText(item.id, '')}>
              <Link to={paths.v1.healthRecords.view(toText(item.id, ''))}>
                #{toText(item.id, '')} — {toText(item.professional_name, '')}
              </Link>
              <span className="badge text-bg-secondary ms-2">{labelOf(HEALTH_RECORD_STATUS, item.status)}</span>
            </li>
          ))}
        </ul>
      )}
      <Link className="btn btn-outline-primary btn-sm" to={`${paths.v1.healthRecords.create}?patient_id=${id}`}>
        Novo prontuário
      </Link>

      <h2 className="h5 mt-4">Alergias ({allergies.length})</h2>
      {allergies.length === 0 ? (
        <p className="text-body-secondary">Nenhuma alergia registrada.</p>
      ) : (
        <ul className="list-group mb-2">
          {allergies.map((item) => (
            <li className="list-group-item" key={toText(item.id, '')}>
              <Link to={paths.v1.healthAllergies.view(toText(item.id, ''))}>{toText(item.substance, '')}</Link>
              <span className="badge text-bg-secondary ms-2">{labelOf(HEALTH_SEVERITY, item.severity)}</span>
            </li>
          ))}
        </ul>
      )}
      <Link className="btn btn-outline-primary btn-sm" to={`${paths.v1.healthAllergies.create}?patient_id=${id}`}>
        Nova alergia
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
      title={(row) => toText(row.name, '') || `Paciente #${id}`}
      fallbackTitle={`Paciente #${id}`}
      subtitle="Paciente: dados clínicos básicos; nome e contato vêm do perfil do usuário."
      backPath={paths.v1.healthPatients.list}
      editPath={paths.v1.healthPatients.update(id)}
      fields={[
        { label: 'Paciente', value: (row) => toText(row.name, '') },
        { label: 'Usuário', value: (row) => toText(row.username, '') },
        /*
        CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:39:09
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-patients\GetPage.tsx
        LINHA ALTERADA - linha 108 neste arquivo editado:
        Era : { label: 'CPF', value: (row) => toText(row.cpf, '') },
        Ficou : { label: 'CPF', value: (row) => formatCpf(row.cpf) },
        Motivo: exibir com mascara (o dado no banco continua sem mascara).
        */
        { label: 'CPF', value: (row) => formatCpf(row.cpf) },
        /*
        CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:39:09
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-patients\GetPage.tsx
        LINHA ALTERADA - linha 117 neste arquivo editado:
        Era : { label: 'Telefone', value: (row) => toText(row.phone, '') },
        Ficou : { label: 'Telefone', value: (row) => formatPhone(row.phone) },
        Motivo: exibir com mascara (o dado no banco continua sem mascara).
        */
        { label: 'Telefone', value: (row) => formatPhone(row.phone) },
        /*
        CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:39:09
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-patients\GetPage.tsx
        LINHA ALTERADA - linha 126 neste arquivo editado:
        Era : { label: 'WhatsApp', value: (row) => toText(row.whatsapp, '') },
        Ficou : { label: 'WhatsApp', value: (row) => formatPhone(row.whatsapp) },
        Motivo: exibir com mascara (o dado no banco continua sem mascara).
        */
        { label: 'WhatsApp', value: (row) => formatPhone(row.whatsapp) },
        { label: 'E-mail', value: (row) => toText(row.email, '') },
        { label: 'Nascimento', value: (row) => toText(row.birth_date, '') },
        { label: 'Idade', value: (row) => toText(row.age, '') },
        { label: 'Sexo', value: (row) => labelOf(HEALTH_SEX, row.sex) },
        { label: 'Tipo sanguíneo', value: (row) => labelOf(HEALTH_BLOOD_TYPE, row.blood_type) },
        { label: 'Convênio', value: (row) => toText(row.insurance_name, '') },
        { label: 'Nº da carteirinha', value: (row) => toText(row.insurance_number, '') },
        { label: 'Contato de emergência', value: (row) => toText(row.emergency_contact_name, '') },
        /*
        CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:39:09
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-patients\GetPage.tsx
        LINHA ALTERADA - linha 143 neste arquivo editado:
        Era : { label: 'Telefone de emergência', value: (row) => toText(row.emergency_contact_phone, '') },
        Ficou : { label: 'Telefone de emergência', value: (row) => formatPhone(row.emergency_contact_phone) },
        Motivo: exibir com mascara (o dado no banco continua sem mascara).
        */
        { label: 'Telefone de emergência', value: (row) => formatPhone(row.emergency_contact_phone) },
        { label: 'Status', value: (row) => labelOf(HEALTH_PATIENT_STATUS, row.status) },
        { label: 'Observações', value: (row) => toText(row.notes, '') },
      ]}
    >
      {(row) => <PatientExtras row={row} />}
    </RecordDetail>
  );
}
