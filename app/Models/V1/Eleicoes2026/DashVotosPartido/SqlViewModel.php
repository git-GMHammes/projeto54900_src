<?php

namespace App\Models\V1\Eleicoes2026\DashVotosPartido;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_dash_votos_partido — Votos do candidato 22001 por cargo e partido.
 *
 * Sem coluna id e sem chave unica. Sem company_id: catalogo global, leitura pelo token especial das Eleicoes ou admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_dash_votos_partido';
    protected $primaryKey = 'ds_cargo';

    protected array $likeFields = [
        'ds_cargo',
        'sg_partido',
        'nm_votavel',
    ];

    protected array $sortableFields = [
        'ds_cargo',
        'nr_partido',
        'sg_partido',
        'nr_votavel',
        'nm_votavel',
        'qt_votos',
        'qt_municipios',
        'qt_secoes',
        'pct_votos_cargo',
    ];

    public array $searchFields = [
        'sg_partido',
        'nm_votavel',
    ];

    public array $filterFields = [
        'ds_cargo',
        'nr_partido',
        'sg_partido',
        'nr_votavel',
        'nm_votavel',
        'qt_votos',
        'qt_municipios',
        'qt_secoes',
        'pct_votos_cargo',
    ];
}
