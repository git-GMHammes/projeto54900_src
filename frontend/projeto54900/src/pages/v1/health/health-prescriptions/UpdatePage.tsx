// Edicao de receitas -- build 'editar-receita' (form_manager, tabela health_prescriptions).
// Wrapper do RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';
import { healthPrescriptionsTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  /*
  CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:45:16
  Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-prescriptions\UpdatePage.tsx
  LINHA ADICIONADA - linha 20 neste arquivo editado: record_id: toText(record.record_id, ''),
  Antes de : const toValues = (record: ApiRow): Record<string, string> => ({
  Depois de : medication: toText(record.medication, ''),
  Motivo: os vinculos deixam de ser imutaveis e passam a vir preenchidos na edicao.
  */
  record_id: toText(record.record_id, ''),
  medication: toText(record.medication, ''),
  dosage: toText(record.dosage, ''),
  frequency: toText(record.frequency, ''),
  duration: toText(record.duration, ''),
  instructions: toText(record.instructions, ''),
});

const loadRecord = (id: string) => healthPrescriptionsTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-receita"
      backPath={paths.v1.healthPrescriptions.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Receita atualizada."
      fallbackTitle={`Editar Receita #${id ?? ''}`}
    />
  );
}
