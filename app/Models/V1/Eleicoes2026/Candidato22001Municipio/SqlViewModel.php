<?php

namespace App\Models\V1\Eleicoes2026\Candidato22001Municipio;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_eleicoes_2026_22001_22_municipio — votos do candidato 22001 agregados (soma de qt_votos por cargo).
 *
 * Sem coluna id e sem chave unica. Sem company_id: catalogo global, acesso restrito a admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_eleicoes_2026_22001_22_municipio';
    protected $primaryKey = 'cd_municipio';

    protected array $likeFields = [
        'cd_municipio',
        'nm_municipio',
        'ds_cargo',

    ];

    protected array $sortableFields = [
        'cd_municipio',
        'nm_municipio',
        'ds_cargo',
        'qt_votos',
        'qt_secoes',
    ];

    public array $searchFields = [
        'cd_municipio',
        'nm_municipio',

    ];

    public array $filterFields = [
        'cd_municipio',
        'nm_municipio',
        'ds_cargo',
        'qt_votos',
        'qt_secoes',
    ];
}
