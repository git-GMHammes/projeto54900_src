<?php

namespace App\Services\V1\Health\HealthUserIdentity;

use App\Models\V1\Health\HealthUserIdentity\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service somente leitura sobre view_health_user_identity (identidade de saude do usuario na empresa).
 *
 * is_doctor = 1 quando o usuario tem registro profissional active (health_registrations); is_patient = 1 quando e
 * paciente active (health_patients). O isolamento por empresa vem da coluna company_id da view.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:18:40
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122160000_modulo_saude_apis_plano.json
Objetivo: Processor de leitura de view_health_user_identity.
Proposito: expor a API V1 do modulo Health (Saude), um submodulo por tabela ou view criada no banco DEV, seguindo o padrao ROADMAP_padrao_modulo (6 camadas, 18 rotas por tabela, 9 por view).
Motivo: pedido do usuario para gerar apenas APIs e backend das 7 tabelas e 8 views health_*.
Ligacoes: company_manager (company_id da sessao), user_manager e user_profiles (medico e paciente), service_order e service_manager (atendimento), health_* (demais submodulos).
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthUserIdentity\Processor.php
*/
