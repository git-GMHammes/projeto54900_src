<?php

namespace App\Models\V1\Health\HealthRegistrations;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_health_registrations — registro profissional com titular (usuario ou empresa), CPF e rotulo do conselho.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de health_registrations for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'health_registrations';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_health_registrations';
    protected $primaryKey = 'id';

    protected array $likeFields = ['holder_name', 'username', 'user_name', 'user_cpf', 'company_name', 'registration_number', 'registration_label', 'specialty', 'council', 'state'];

    protected array $sortableFields = [
        'id',
        'subject_type',
        'user_id',
        'username',
        'holder_name',
        'council',
        'registration_number',
        'state',
        'registration_label',
        'specialty',
        'rqe',
        'valid_until',
        'status',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['holder_name', 'username', 'user_name', 'user_cpf', 'company_name', 'registration_number', 'registration_label', 'specialty', 'council', 'state'];

    public array $filterFields = ['subject_type', 'user_id', 'council', 'state', 'status'];
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:18:40
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122160000_modulo_saude_apis_plano.json
Objetivo: Model da view view_health_registrations.
Proposito: expor a API V1 do modulo Health (Saude), um submodulo por tabela ou view criada no banco DEV, seguindo o padrao ROADMAP_padrao_modulo (6 camadas, 18 rotas por tabela, 9 por view).
Motivo: pedido do usuario para gerar apenas APIs e backend das 7 tabelas e 8 views health_*.
Ligacoes: company_manager (company_id da sessao), user_manager e user_profiles (medico e paciente), service_order e service_manager (atendimento), health_* (demais submodulos).
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Models\V1\Health\HealthRegistrations\SqlViewModel.php
*/
