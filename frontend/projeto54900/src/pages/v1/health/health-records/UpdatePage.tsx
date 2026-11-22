// Edicao de prontuários -- build 'editar-prontuario' (form_manager, tabela health_records).
// Wrapper do RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';
import { healthRecordsTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  /*
  CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:45:16
  Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-records\UpdatePage.tsx
  BLOCO ADICIONADO - 2 linhas (20 a 21 neste arquivo editado): valores iniciais dos campos de vinculo (patient_id, professional_id)
  Antes de : const toValues = (record: ApiRow): Record<string, string> => ({
  Depois de : service_order_id: toText(record.service_order_id, ''),
  Motivo: os vinculos deixam de ser imutaveis e passam a vir preenchidos na edicao.
  */
  patient_id: toText(record.patient_id, ''),
  professional_id: toText(record.professional_id, ''),
  service_order_id: toText(record.service_order_id, ''),
  complaint: toText(record.complaint, ''),
  anamnesis: toText(record.anamnesis, ''),
  diagnosis: toText(record.diagnosis, ''),
  cid10: toText(record.cid10, ''),
  conduct: toText(record.conduct, ''),
  notes: toText(record.notes, ''),
});

const loadRecord = (id: string) => healthRecordsTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-prontuario"
      backPath={paths.v1.healthRecords.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Prontuário atualizado."
      fallbackTitle={`Editar Prontuário #${id ?? ''}`}
    />
  );
}
