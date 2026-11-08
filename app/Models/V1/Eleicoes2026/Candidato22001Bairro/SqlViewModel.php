<?php

namespace App\Models\V1\Eleicoes2026\Candidato22001Bairro;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_eleicoes_2026_22001_22_bairro — votos do candidato 22001 agregados (soma de qt_votos por cargo).
 *
 * Sem coluna id e sem chave unica. Sem company_id: catalogo global, acesso restrito a admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_eleicoes_2026_22001_22_bairro';
    protected $primaryKey = 'cd_municipio';

    protected array $likeFields = [
        'cd_municipio',
        'nm_municipio',
        'ds_cargo',
        'nm_bairro',
    ];

    protected array $sortableFields = [
        'cd_municipio',
        'nm_municipio',
        'nm_bairro',
        'ds_cargo',
        'nr_votavel',
        'qt_votos',
        'qt_secoes',
    ];

    public array $searchFields = [
        'cd_municipio',
        'nm_municipio',
        'nm_bairro',
    ];

    public array $filterFields = [
        'cd_municipio',
        'nm_municipio',
        'nm_bairro',
        'ds_cargo',
        'nr_votavel',
        'qt_votos',
        'qt_secoes',
    ];
}
