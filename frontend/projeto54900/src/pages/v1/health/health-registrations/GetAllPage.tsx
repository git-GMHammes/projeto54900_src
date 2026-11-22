// Lista de registros profissionais (CRM e outros conselhos) (view_health_registrations) -- api/v1/health-registrations-view. Wrapper do ListBuild (slug 'health-registrations': colunas, acoes e busca vem do banco).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="health-registrations"
      backFallback={paths.home}
      createPath={paths.v1.healthRegistrations.create}
      createLabel="Novo registro"
      searchPlaceholder="Buscar por titular, conselho, número ou especialidade"
      emptyTitle="Nenhum registro profissional encontrado"
      emptyDescription="Cadastre o primeiro registro profissional."
    />
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170100_saude_front_registrations_plano.json
Objetivo: Lista de registros profissionais (CRM e outros conselhos) com busca e CRUD (ListBuild).
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-registrations\GetAllPage.tsx
*/
