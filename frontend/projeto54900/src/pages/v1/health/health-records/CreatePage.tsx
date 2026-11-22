// Cadastro de prontuários -- build 'criar-prontuario' (form_manager, tabela health_records).
// Wrapper do RecordFormBuild. `?patient_id=` e `?service_order_id=` pre-seleciona o campo correspondente.
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  const [params] = useSearchParams();
  const patientId = params.get('patient_id') ?? '';
  const serviceOrderId = params.get('service_order_id') ?? '';
  const defaults = useMemo(() => ({ ...(patientId ? { patient_id: patientId } : {}), ...(serviceOrderId ? { service_order_id: serviceOrderId } : {}) }), [patientId, serviceOrderId]);

  return (
    <RecordFormBuild
      slug="criar-prontuario"
      backPath={paths.v1.healthRecords.list}
      defaults={defaults}
      successMessage="Prontuário registrado."
      fallbackTitle="Novo Prontuário"
    />
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170300_saude_front_records_plano.json
Objetivo: Cadastro de prontuários (RecordFormBuild).
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-records\CreatePage.tsx
*/
