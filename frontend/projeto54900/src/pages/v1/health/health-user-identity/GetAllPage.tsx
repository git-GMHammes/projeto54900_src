// Lista da identidade de saude (view_health_user_identity) -- api/v1/health-user-identity-view. So leitura: quem e medico e quem e paciente.
// Wrapper do ListBuild (slug 'health-user-identity': colunas, acoes e busca vem do banco). Sem cadastro: o dado vem de Registros profissionais e Pacientes.
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="health-user-identity"
      backFallback={paths.home}
      searchPlaceholder="Buscar por usuário ou nome"
      emptyTitle="Nenhum usuário com perfil de saúde"
      emptyDescription="Cadastre um registro profissional ou um paciente."
    />
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170800_saude_front_identity_plano.json
Objetivo: Lista somente leitura da identidade de saude.
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-user-identity\GetAllPage.tsx
*/
