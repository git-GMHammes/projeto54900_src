// Visualizacao de um registro de alergias (view_health_allergies): dados completos. Wrapper do RecordDetail.
import { useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import { paths } from '@/routes/paths';
import { healthAllergiesView } from '@/services/v1';
import { toText } from '@/utils/format';
import { HEALTH_SEVERITY, labelOf } from '@/utils/recordLabels';

const load = (id: string) => healthAllergiesView.get(id);

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => `${toText(row.substance, '')} — ${toText(row.patient_name, '')}`}
      fallbackTitle={`Alergia #${id}`}
      subtitle="Alergia registrada para um paciente."
      backPath={paths.v1.healthAllergies.list}
      editPath={paths.v1.healthAllergies.update(id)}
      fields={[
        { label: 'Paciente', value: (row) => toText(row.patient_name, '') },
        { label: 'Substância', value: (row) => toText(row.substance, '') },
        { label: 'Reação', value: (row) => toText(row.reaction, '') },
        { label: 'Gravidade', value: (row) => labelOf(HEALTH_SEVERITY, row.severity) },
        { label: 'Observações', value: (row) => toText(row.notes, '') },
      ]}
    />
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170700_saude_front_allergies_plano.json
Objetivo: Detalhe de alergias (RecordDetail).
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-allergies\GetPage.tsx
*/
