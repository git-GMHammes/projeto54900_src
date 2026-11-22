// Visualizacao de um registro de registros profissionais (CRM e outros conselhos) (view_health_registrations): dados completos. Wrapper do RecordDetail.
import { useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import { paths } from '@/routes/paths';
import { healthRegistrationsView } from '@/services/v1';
/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:39:09
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-registrations\GetPage.tsx
LINHA ALTERADA - linha 15 neste arquivo editado:
Era : import { toText } from '@/utils/format';
Ficou : import { formatCpf, toText } from '@/utils/format';
Motivo: importar os formatadores de CPF/telefone.
*/
import { formatCpf, toText } from '@/utils/format';
import { HEALTH_REGISTRATION_STATUS, HEALTH_SUBJECT_TYPE, labelOf } from '@/utils/recordLabels';

const load = (id: string) => healthRegistrationsView.get(id);

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => `${toText(row.holder_name, '')} — ${toText(row.registration_label, '')}`}
      fallbackTitle={`Registro profissional #${id}`}
      subtitle="Registro em conselho profissional (CRM e outros) de usuário ou empresa."
      backPath={paths.v1.healthRegistrations.list}
      editPath={paths.v1.healthRegistrations.update(id)}
      fields={[
        { label: 'Titular', value: (row) => toText(row.holder_name, '') },
        { label: 'Tipo do titular', value: (row) => labelOf(HEALTH_SUBJECT_TYPE, row.subject_type) },
        { label: 'Usuário', value: (row) => toText(row.username, '') },
        /*
        CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:39:09
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-registrations\GetPage.tsx
        LINHA ALTERADA - linha 44 neste arquivo editado:
        Era : { label: 'CPF do usuário', value: (row) => toText(row.user_cpf, '') },
        Ficou : { label: 'CPF do usuário', value: (row) => formatCpf(row.user_cpf) },
        Motivo: exibir com mascara (o dado no banco continua sem mascara).
        */
        { label: 'CPF do usuário', value: (row) => formatCpf(row.user_cpf) },
        { label: 'Empresa', value: (row) => toText(row.company_name, '') },
        { label: 'Conselho', value: (row) => toText(row.registration_label, '') },
        { label: 'Especialidade', value: (row) => toText(row.specialty, '') },
        { label: 'RQE', value: (row) => toText(row.rqe, '') },
        { label: 'Validade', value: (row) => toText(row.valid_until, '') },
        { label: 'Status', value: (row) => labelOf(HEALTH_REGISTRATION_STATUS, row.status) },
        { label: 'Observações', value: (row) => toText(row.notes, '') },
      ]}
    />
  );
}
