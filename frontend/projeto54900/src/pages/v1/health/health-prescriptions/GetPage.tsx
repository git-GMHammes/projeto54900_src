// Visualizacao de um registro de receitas (view_health_prescriptions): dados completos. Wrapper do RecordDetail.
import { useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import { paths } from '@/routes/paths';
import { healthPrescriptionsView } from '@/services/v1';
import { toText } from '@/utils/format';
import { HEALTH_RECORD_STATUS, labelOf } from '@/utils/recordLabels';

const load = (id: string) => healthPrescriptionsView.get(id);

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => `${toText(row.medication, '')} — ${toText(row.patient_name, '')}`}
      fallbackTitle={`Receita #${id}`}
      subtitle="Receita de um prontuário."
      backPath={paths.v1.healthPrescriptions.list}
      editPath={(row) => (toText(row.record_status, '') === 'draft' ? paths.v1.healthPrescriptions.update(id) : undefined)}
      fields={[
        { label: 'Paciente', value: (row) => toText(row.patient_name, '') },
        { label: 'Prontuário', value: (row) => `#${toText(row.record_id, '')} (${labelOf(HEALTH_RECORD_STATUS, row.record_status)})` },
        { label: 'Medicamento', value: (row) => toText(row.medication, '') },
        { label: 'Dose', value: (row) => toText(row.dosage, '') },
        { label: 'Frequência', value: (row) => toText(row.frequency, '') },
        { label: 'Duração', value: (row) => toText(row.duration, '') },
        { label: 'Orientações', value: (row) => toText(row.instructions, '') },
      ]}
    />
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170400_saude_front_prescriptions_plano.json
Objetivo: Detalhe de receitas (RecordDetail).
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-prescriptions\GetPage.tsx
*/
