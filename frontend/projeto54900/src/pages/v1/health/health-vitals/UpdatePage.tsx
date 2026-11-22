// Edicao de sinais vitais -- build 'editar-sinais-vitais' (form_manager, tabela health_vitals).
// Wrapper do RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';
import { healthVitalsTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  record_id: toText(record.record_id, ''),
  measured_at: toText(record.measured_at, ''),
  blood_pressure: toText(record.blood_pressure, ''),
  heart_rate: toText(record.heart_rate, ''),
  weight_kg: toText(record.weight_kg, ''),
  height_cm: toText(record.height_cm, ''),
  temperature: toText(record.temperature, ''),
  oxygen_saturation: toText(record.oxygen_saturation, ''),
  /*
  CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:47:42
  Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-vitals\UpdatePage.tsx
  BLOCO ADICIONADO - 8 linhas (36 a 43 neste arquivo editado):
  glucose_mg_dl: toText(record.glucose_mg_dl, ''),
  glucose_context: toText(record.glucose_context, ''),
  total_cholesterol_mg_dl: toText(record.total_cholesterol_mg_dl, ''),
  triglycerides_mg_dl: toText(record.triglycerides_mg_dl, ''),
  uric_acid_mg_dl: toText(record.uric_acid_mg_dl, ''),
  respiratory_rate: toText(record.respiratory_rate, ''),
  waist_cm: toText(record.waist_cm, ''),
  body_fat_percent: toText(record.body_fat_percent, ''),
  Antes de : oxygen_saturation: toText(record.oxygen_saturation, ''),
  Depois de : });
  Motivo: carregar as colunas novas no formulario de edicao.
  */
  glucose_mg_dl: toText(record.glucose_mg_dl, ''),
  glucose_context: toText(record.glucose_context, ''),
  total_cholesterol_mg_dl: toText(record.total_cholesterol_mg_dl, ''),
  triglycerides_mg_dl: toText(record.triglycerides_mg_dl, ''),
  uric_acid_mg_dl: toText(record.uric_acid_mg_dl, ''),
  respiratory_rate: toText(record.respiratory_rate, ''),
  waist_cm: toText(record.waist_cm, ''),
  body_fat_percent: toText(record.body_fat_percent, ''),
});

const loadRecord = (id: string) => healthVitalsTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-sinais-vitais"
      backPath={paths.v1.healthVitals.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Sinais vitais atualizados."
      fallbackTitle={`Editar Sinais Vitais #${id ?? ''}`}
    />
  );
}
