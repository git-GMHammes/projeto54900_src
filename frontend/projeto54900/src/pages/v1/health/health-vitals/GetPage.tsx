// Visualizacao de um registro de sinais vitais (view_health_vitals): dados completos. Wrapper do RecordDetail.
import { useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import { paths } from '@/routes/paths';
import { healthVitalsView } from '@/services/v1';
import { toText } from '@/utils/format';

const load = (id: string) => healthVitalsView.get(id);

/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:47:42
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-vitals\GetPage.tsx
BLOCO ADICIONADO - 2 linhas (21 a 22 neste arquivo editado):
const GLUCOSE_CONTEXT: Record<string, string> = { fasting: 'Jejum', post_meal: 'Pós-refeição', random: 'Aleatória', bedtime: 'Ao deitar' };

Antes de : (linha em branco)
Depois de : export default function GetPage() {
Motivo: rotulos do momento da glicemia.
*/
const GLUCOSE_CONTEXT: Record<string, string> = { fasting: 'Jejum', post_meal: 'Pós-refeição', random: 'Aleatória', bedtime: 'Ao deitar' };

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => `Sinais vitais #${id} — ${toText(row.patient_name, '')}`}
      fallbackTitle={`Sinais vitais #${id}`}
      subtitle="Sinais vitais medidos em um prontuário."
      backPath={paths.v1.healthVitals.list}
      editPath={paths.v1.healthVitals.update(id)}
      fields={[
        { label: 'Paciente', value: (row) => toText(row.patient_name, '') },
        { label: 'Prontuário', value: (row) => `#${toText(row.record_id, '')}` },
        { label: 'Medido em', value: (row) => toText(row.measured_at, '') },
        { label: 'Peso (kg)', value: (row) => toText(row.weight_kg, '') },
        { label: 'Altura (cm)', value: (row) => toText(row.height_cm, '') },
        { label: 'IMC', value: (row) => toText(row.bmi, '') },
        { label: 'Pressão arterial', value: (row) => toText(row.blood_pressure, '') },
        { label: 'Freq. cardíaca (bpm)', value: (row) => toText(row.heart_rate, '') },
        { label: 'Temperatura (°C)', value: (row) => toText(row.temperature, '') },
        { label: 'SpO2 (%)', value: (row) => toText(row.oxygen_saturation, '') },
        /*
        CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 17:47:42
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-vitals\GetPage.tsx
        BLOCO ADICIONADO - 8 linhas (62 a 69 neste arquivo editado):
        { label: 'Glicemia (mg/dL)', value: (row) => toText(row.glucose_mg_dl, '') },
        { label: 'Momento da glicemia', value: (row) => GLUCOSE_CONTEXT[toText(row.glucose_context, '')] ?? toText(row.glucose_context, '') },
        { label: 'Colesterol total (mg/dL)', value: (row) => toText(row.total_cholesterol_mg_dl, '') },
        { label: 'Triglicerídeos (mg/dL)', value: (row) => toText(row.triglycerides_mg_dl, '') },
        { label: 'Ácido úrico (mg/dL)', value: (row) => toText(row.uric_acid_mg_dl, '') },
        { label: 'Freq. respiratória (irpm)', value: (row) => toText(row.respiratory_rate, '') },
        { label: 'Cintura (cm)', value: (row) => toText(row.waist_cm, '') },
        { label: 'Gordura corporal (%)', value: (row) => toText(row.body_fat_percent, '') },
        Antes de : { label: 'SpO2 (%)', value: (row) => toText(row.oxygen_saturation, '') },
        Depois de : ]}
        Motivo: mostrar no detalhe as medidas dos aparelhos de farmacia.
        */
        { label: 'Glicemia (mg/dL)', value: (row) => toText(row.glucose_mg_dl, '') },
        { label: 'Momento da glicemia', value: (row) => GLUCOSE_CONTEXT[toText(row.glucose_context, '')] ?? toText(row.glucose_context, '') },
        { label: 'Colesterol total (mg/dL)', value: (row) => toText(row.total_cholesterol_mg_dl, '') },
        { label: 'Triglicerídeos (mg/dL)', value: (row) => toText(row.triglycerides_mg_dl, '') },
        { label: 'Ácido úrico (mg/dL)', value: (row) => toText(row.uric_acid_mg_dl, '') },
        { label: 'Freq. respiratória (irpm)', value: (row) => toText(row.respiratory_rate, '') },
        { label: 'Cintura (cm)', value: (row) => toText(row.waist_cm, '') },
        { label: 'Gordura corporal (%)', value: (row) => toText(row.body_fat_percent, '') },
      ]}
    />
  );
}
