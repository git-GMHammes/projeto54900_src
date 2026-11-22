// Lista de alergias (view_health_allergies) -- api/v1/health-allergies-view. Wrapper do ListBuild (slug 'health-allergies': colunas, acoes e busca vem do banco).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="health-allergies"
      backFallback={paths.home}
      createPath={paths.v1.healthAllergies.create}
      createLabel="Nova alergia"
      searchPlaceholder="Buscar por paciente, substância ou reação"
      emptyTitle="Nenhuma alergia encontrada"
      emptyDescription="Registre a primeira alergia."
    />
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170700_saude_front_allergies_plano.json
Objetivo: Lista de alergias com busca e CRUD (ListBuild).
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-allergies\GetAllPage.tsx
*/
