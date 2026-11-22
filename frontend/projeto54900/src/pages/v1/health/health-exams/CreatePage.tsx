// Cadastro de exames -- build 'criar-exame' (form_manager, tabela health_exams).
// Wrapper do RecordFormBuild. `?record_id=` pre-seleciona o campo correspondente.
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  const [params] = useSearchParams();
  const recordId = params.get('record_id') ?? '';
  const defaults = useMemo(() => ({ ...(recordId ? { record_id: recordId } : {}) }), [recordId]);

  return (
    <RecordFormBuild
      slug="criar-exame"
      backPath={paths.v1.healthExams.list}
      defaults={defaults}
      successMessage="Exame registrado."
      fallbackTitle="Novo Exame"
    />
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170500_saude_front_exams_plano.json
Objetivo: Cadastro de exames (RecordFormBuild).
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-exams\CreatePage.tsx
*/
