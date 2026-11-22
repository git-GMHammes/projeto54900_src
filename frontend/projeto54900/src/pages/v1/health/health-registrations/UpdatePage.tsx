// Edicao de registros profissionais (CRM e outros conselhos) -- build 'editar-registro-profissional' (form_manager, tabela health_registrations).
// Wrapper do RecordFormBuild: busca o registro por id e preenche o form.
import { useParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';
import { healthRegistrationsTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  council: toText(record.council, ''),
  state: toText(record.state, ''),
  registration_number: toText(record.registration_number, ''),
  rqe: toText(record.rqe, ''),
  specialty: toText(record.specialty, ''),
  valid_until: toText(record.valid_until, ''),
  status: toText(record.status, ''),
  notes: toText(record.notes, ''),
});

const loadRecord = (id: string) => healthRegistrationsTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormBuild
      slug="editar-registro-profissional"
      backPath={paths.v1.healthRegistrations.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Registro profissional atualizado."
      fallbackTitle={`Editar Registro Profissional #${id ?? ''}`}
    />
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170100_saude_front_registrations_plano.json
Objetivo: Edicao de registros profissionais (CRM e outros conselhos) (RecordFormBuild).
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-registrations\UpdatePage.tsx
*/
