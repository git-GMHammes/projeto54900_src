<?php

namespace App\Models\V1\Eleicoes2026\DashVotosZona;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_dash_votos_zona — Votos do candidato 22001 e eleitorado por municipio, zona e cargo.
 *
 * Sem coluna id e sem chave unica. Sem company_id: catalogo global, leitura pelo token especial das Eleicoes ou admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_dash_votos_zona';
    protected $primaryKey = 'cd_municipio';

    protected array $likeFields = [
        'cd_municipio',
        'nm_municipio',
        'nr_zona',
        'ds_cargo',
    ];

    protected array $sortableFields = [
        'cd_municipio',
        'nm_municipio',
        'nr_zona',
        'ds_cargo',
        'nr_votavel',
        'qt_votos',
        'qt_secoes_com_voto',
        'qt_eleitores',
        'qt_secoes',
        'pct_votos_eleitorado',
        'pct_votos_estado',
    ];

    public array $searchFields = [
        'cd_municipio',
        'nm_municipio',
    ];

    public array $filterFields = [
        'cd_municipio',
        'nm_municipio',
        'nr_zona',
        'ds_cargo',
        'nr_votavel',
        'qt_votos',
        'qt_secoes_com_voto',
        'qt_eleitores',
        'qt_secoes',
        'pct_votos_eleitorado',
        'pct_votos_estado',
    ];
}
