// Lista de receitas (view_health_prescriptions) -- api/v1/health-prescriptions-view. Wrapper do ListBuild (slug 'health-prescriptions': colunas, acoes e busca vem do banco).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="health-prescriptions"
      backFallback={paths.home}
      createPath={paths.v1.healthPrescriptions.create}
      createLabel="Nova receita"
      searchPlaceholder="Buscar por paciente ou medicamento"
      emptyTitle="Nenhuma receita encontrada"
      emptyDescription="Registre a primeira receita."
    />
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170400_saude_front_prescriptions_plano.json
Objetivo: Lista de receitas com busca e CRUD (ListBuild).
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-prescriptions\GetAllPage.tsx
*/
