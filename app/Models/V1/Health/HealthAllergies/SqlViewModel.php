<?php

namespace App\Models\V1\Health\HealthAllergies;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_health_allergies — alergia com paciente.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de health_allergies for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'health_allergies';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_health_allergies';
    protected $primaryKey = 'id';

    protected array $likeFields = ['patient_name', 'substance', 'reaction', 'notes'];

    protected array $sortableFields = [
        'id',
        'patient_id',
        'patient_user_id',
        'patient_name',
        'substance',
        'reaction',
        'severity',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['patient_name', 'substance', 'reaction', 'notes'];

    public array $filterFields = ['patient_id', 'patient_user_id', 'severity'];
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:18:40
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122160000_modulo_saude_apis_plano.json
Objetivo: Model da view view_health_allergies.
Proposito: expor a API V1 do modulo Health (Saude), um submodulo por tabela ou view criada no banco DEV, seguindo o padrao ROADMAP_padrao_modulo (6 camadas, 18 rotas por tabela, 9 por view).
Motivo: pedido do usuario para gerar apenas APIs e backend das 7 tabelas e 8 views health_*.
Ligacoes: company_manager (company_id da sessao), user_manager e user_profiles (medico e paciente), service_order e service_manager (atendimento), health_* (demais submodulos).
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Models\V1\Health\HealthAllergies\SqlViewModel.php
*/
