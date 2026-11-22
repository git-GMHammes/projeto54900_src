// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre view_health_exams — exames.
// Espelho de app/Config/Routes/Api/v1/Health/HealthExams/EndPointView.php, grupo api/v1/health-exams-view.
// Para ESCRITA, ver o arquivo .table.ts correspondente.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const healthExamsView = createResource(API_GROUPS.healthExamsView, 'v1', { mutations: false });

export default healthExamsView;

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170500_saude_front_exams_plano.json
Objetivo: Service REST somente leitura da view view_health_exams.
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\services\v1\healthExams.view.ts
*/
