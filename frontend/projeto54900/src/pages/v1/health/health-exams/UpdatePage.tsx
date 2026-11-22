// Edicao de exames -- build 'editar-exame' (form_manager, tabela health_exams).
// Wrapper do RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';
import { healthExamsTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  /*
  CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:45:16
  Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-exams\UpdatePage.tsx
  LINHA ADICIONADA - linha 20 neste arquivo editado: record_id: toText(record.record_id, ''),
  Antes de : const toValues = (record: ApiRow): Record<string, string> => ({
  Depois de : name: toText(record.name, ''),
  Motivo: os vinculos deixam de ser imutaveis e passam a vir preenchidos na edicao.
  */
  record_id: toText(record.record_id, ''),
  name: toText(record.name, ''),
  status: toText(record.status, ''),
  requested_at: toText(record.requested_at, ''),
  result_at: toText(record.result_at, ''),
  result_text: toText(record.result_text, ''),
});

const loadRecord = (id: string) => healthExamsTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-exame"
      backPath={paths.v1.healthExams.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Exame atualizado."
      fallbackTitle={`Editar Exame #${id ?? ''}`}
    />
  );
}
