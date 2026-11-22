// Edicao de pacientes -- build 'editar-paciente' (form_manager, tabela health_patients).
// Wrapper do RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';
import { healthPatientsTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  /*
  CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:45:16
  Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-patients\UpdatePage.tsx
  LINHA ADICIONADA - linha 20 neste arquivo editado: user_id: toText(record.user_id, ''),
  Antes de : const toValues = (record: ApiRow): Record<string, string> => ({
  Depois de : birth_date: toText(record.birth_date, ''),
  Motivo: os vinculos deixam de ser imutaveis e passam a vir preenchidos na edicao.
  */
  user_id: toText(record.user_id, ''),
  birth_date: toText(record.birth_date, ''),
  sex: toText(record.sex, ''),
  blood_type: toText(record.blood_type, ''),
  insurance_name: toText(record.insurance_name, ''),
  insurance_number: toText(record.insurance_number, ''),
  emergency_contact_name: toText(record.emergency_contact_name, ''),
  emergency_contact_phone: toText(record.emergency_contact_phone, ''),
  status: toText(record.status, ''),
  notes: toText(record.notes, ''),
});

const loadRecord = (id: string) => healthPatientsTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-paciente"
      backPath={paths.v1.healthPatients.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Paciente atualizado."
      fallbackTitle={`Editar Paciente #${id ?? ''}`}
    />
  );
}
