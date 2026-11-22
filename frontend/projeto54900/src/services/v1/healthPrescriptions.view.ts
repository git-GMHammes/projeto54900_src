// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre view_health_prescriptions — receitas.
// Espelho de app/Config/Routes/Api/v1/Health/HealthPrescriptions/EndPointView.php, grupo api/v1/health-prescriptions-view.
// Para ESCRITA, ver o arquivo .table.ts correspondente.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const healthPrescriptionsView = createResource(API_GROUPS.healthPrescriptionsView, 'v1', { mutations: false });

export default healthPrescriptionsView;

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170400_saude_front_prescriptions_plano.json
Objetivo: Service REST somente leitura da view view_health_prescriptions.
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\services\v1\healthPrescriptions.view.ts
*/
