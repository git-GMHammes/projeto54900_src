// Cadastro de registros profissionais (CRM e outros conselhos) -- build 'criar-registro-profissional' (form_manager, tabela health_registrations).
// Wrapper do RecordFormBuild: o formulario vem do banco.
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <RecordFormBuild
      slug="criar-registro-profissional"
      backPath={paths.v1.healthRegistrations.list}
      successMessage="Registro profissional cadastrado."
      fallbackTitle="Novo Registro Profissional"
    />
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170100_saude_front_registrations_plano.json
Objetivo: Cadastro de registros profissionais (CRM e outros conselhos) (RecordFormBuild).
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-registrations\CreatePage.tsx
*/
