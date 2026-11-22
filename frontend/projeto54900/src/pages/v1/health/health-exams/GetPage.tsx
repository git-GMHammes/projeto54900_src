// Visualizacao de um registro de exames (view_health_exams): dados completos. Wrapper do RecordDetail.
import { useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:18:32
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-exams\GetPage.tsx
LINHA ADICIONADA - linha 13 neste arquivo editado: import AttachmentsPanel from '@/components/global/AttachmentsPanel';
Antes de : import RecordDetail from '@/components/global/RecordDetail';
Depois de : import { paths } from '@/routes/paths';
Motivo: importar o painel de anexos.
*/
import AttachmentsPanel from '@/components/global/AttachmentsPanel';
import { paths } from '@/routes/paths';
import { healthExamsView } from '@/services/v1';
import { toText } from '@/utils/format';
import { HEALTH_EXAM_STATUS, labelOf } from '@/utils/recordLabels';

const load = (id: string) => healthExamsView.get(id);

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => `${toText(row.name, '')} — ${toText(row.patient_name, '')}`}
      fallbackTitle={`Exame #${id}`}
      subtitle="Exame solicitado em um prontuário e seu resultado."
      backPath={paths.v1.healthExams.list}
      editPath={paths.v1.healthExams.update(id)}
      fields={[
        { label: 'Paciente', value: (row) => toText(row.patient_name, '') },
        { label: 'Prontuário', value: (row) => `#${toText(row.record_id, '')}` },
        { label: 'Exame', value: (row) => toText(row.name, '') },
        { label: 'Solicitado em', value: (row) => toText(row.requested_at, '') },
        { label: 'Resultado em', value: (row) => toText(row.result_at, '') },
        { label: 'Status', value: (row) => labelOf(HEALTH_EXAM_STATUS, row.status) },
        { label: 'Resultado', value: (row) => toText(row.result_text, '') },
      ]}
    /*
    CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:18:32
    Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-exams\GetPage.tsx
    BLOCO ALTERADO - 3 linhas (54 a 56 neste arquivo editado):
    Era :
    />
    Ficou :
    >
      {(row) => <AttachmentsPanel module="HealthExams" referenceId={toText(row.id, '')} />}
    </RecordDetail>
    Motivo: o detalhe do exame passa a ter filhos: o painel de anexos (envio sempre liberado, pois o resultado chega depois).
    */
    >
      {(row) => <AttachmentsPanel module="HealthExams" referenceId={toText(row.id, '')} />}
    </RecordDetail>
  );
}
