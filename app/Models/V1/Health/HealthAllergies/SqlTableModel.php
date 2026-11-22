<?php

namespace App\Models\V1\Health\HealthAllergies;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela health_allergies — alergia do paciente (substancia, reacao, gravidade).
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'health_allergies';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'patient_id',
        'substance',
        'reaction',
        'severity',
        'notes',
    ];

    protected array $likeFields = ['substance', 'reaction', 'notes'];

    protected array $sortableFields = [
        'id',
        'patient_id',
        'substance',
        'reaction',
        'severity',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['substance', 'reaction', 'notes'];
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:18:40
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122160000_modulo_saude_apis_plano.json
Objetivo: Model da tabela health_allergies (alergia do paciente (substancia, reacao, gravidade)).
Proposito: expor a API V1 do modulo Health (Saude), um submodulo por tabela ou view criada no banco DEV, seguindo o padrao ROADMAP_padrao_modulo (6 camadas, 18 rotas por tabela, 9 por view).
Motivo: pedido do usuario para gerar apenas APIs e backend das 7 tabelas e 8 views health_*.
Ligacoes: company_manager (company_id da sessao), user_manager e user_profiles (medico e paciente), service_order e service_manager (atendimento), health_* (demais submodulos).
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Models\V1\Health\HealthAllergies\SqlTableModel.php
*/
