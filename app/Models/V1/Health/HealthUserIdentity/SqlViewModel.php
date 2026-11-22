<?php

namespace App\Models\V1\Health\HealthUserIdentity;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_health_user_identity — identidade de saude do usuario na empresa (is_doctor e is_patient).
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a view tem company_id; so a empresa da sessao aparece. */
    protected string $companyScope = 'column';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_health_user_identity';
    protected $primaryKey = 'user_id';

    protected array $likeFields = ['username', 'name'];

    protected array $sortableFields = [
        'company_id',
        'user_id',
        'username',
        'name',
        'is_doctor',
        'is_patient',
    ];

    public array $searchFields = ['username', 'name'];

    public array $filterFields = ['user_id', 'is_doctor', 'is_patient'];
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:18:40
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122160000_modulo_saude_apis_plano.json
Objetivo: Model da view view_health_user_identity.
Proposito: expor a API V1 do modulo Health (Saude), um submodulo por tabela ou view criada no banco DEV, seguindo o padrao ROADMAP_padrao_modulo (6 camadas, 18 rotas por tabela, 9 por view).
Motivo: pedido do usuario para gerar apenas APIs e backend das 7 tabelas e 8 views health_*.
Ligacoes: company_manager (company_id da sessao), user_manager e user_profiles (medico e paciente), service_order e service_manager (atendimento), health_* (demais submodulos).
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Models\V1\Health\HealthUserIdentity\SqlViewModel.php
*/
