// Edicao de alergias -- build 'editar-alergia' (form_manager, tabela health_allergies).
// Wrapper do RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';
import { healthAllergiesTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  /*
  CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:45:16
  Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-allergies\UpdatePage.tsx
  LINHA ADICIONADA - linha 20 neste arquivo editado: patient_id: toText(record.patient_id, ''),
  Antes de : const toValues = (record: ApiRow): Record<string, string> => ({
  Depois de : substance: toText(record.substance, ''),
  Motivo: os vinculos deixam de ser imutaveis e passam a vir preenchidos na edicao.
  */
  patient_id: toText(record.patient_id, ''),
  substance: toText(record.substance, ''),
  severity: toText(record.severity, ''),
  reaction: toText(record.reaction, ''),
  notes: toText(record.notes, ''),
});

const loadRecord = (id: string) => healthAllergiesTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-alergia"
      backPath={paths.v1.healthAllergies.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Alergia atualizada."
      fallbackTitle={`Editar Alergia #${id ?? ''}`}
    />
  );
}
