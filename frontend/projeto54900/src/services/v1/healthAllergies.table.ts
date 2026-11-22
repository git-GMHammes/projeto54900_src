// PROPOSITO: recurso REST da tabela health_allergies — alergias.
// Espelho de app/Config/Routes/Api/v1/Health/HealthAllergies/EndpointTable.php, grupo api/v1/health-allergies.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const healthAllergiesTable = createResource(API_GROUPS.healthAllergies, 'v1');

export default healthAllergiesTable;

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170700_saude_front_allergies_plano.json
Objetivo: Service REST da tabela health_allergies.
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\services\v1\healthAllergies.table.ts
*/
