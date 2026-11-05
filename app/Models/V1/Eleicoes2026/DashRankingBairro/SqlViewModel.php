<?php

namespace App\Models\V1\Eleicoes2026\DashRankingBairro;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_dash_ranking_bairro — Ranking de bairros por votos do candidato 22001 e por cargo.
 *
 * Sem coluna id e sem chave unica. Sem company_id: catalogo global, leitura pelo token especial das Eleicoes ou admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_dash_ranking_bairro';
    protected $primaryKey = 'cd_municipio';

    protected array $likeFields = [
        'cd_municipio',
        'nm_municipio',
        'nm_bairro',
        'ds_cargo',
    ];

    protected array $sortableFields = [
        'cd_municipio',
        'nm_municipio',
        'nm_bairro',
        'ds_cargo',
        'qt_votos',
        'qt_eleitores',
        'pct_votos_eleitorado',
        'nr_ranking_votos',
        'nr_ranking_pct',
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
        'qt_votos',
        'qt_eleitores',
        'pct_votos_eleitorado',
        'nr_ranking_votos',
        'nr_ranking_pct',
    ];
}
