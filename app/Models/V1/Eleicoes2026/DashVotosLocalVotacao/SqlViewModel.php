<?php

namespace App\Models\V1\Eleicoes2026\DashVotosLocalVotacao;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_dash_votos_local_votacao — Votos do candidato 22001 e eleitorado por local de votacao e cargo.
 *
 * Sem coluna id e sem chave unica. Sem company_id: catalogo global, leitura pelo token especial das Eleicoes ou admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_dash_votos_local_votacao';
    protected $primaryKey = 'cd_municipio';

    protected array $likeFields = [
        'cd_municipio',
        'nm_municipio',
        'nr_zona',
        'nr_local_votacao',
        'nm_local_votacao',
        'ds_endereco',
        'nm_bairro',
        'ds_cargo',
    ];

    protected array $sortableFields = [
        'cd_municipio',
        'nm_municipio',
        'nr_zona',
        'nr_local_votacao',
        'nm_local_votacao',
        'ds_endereco',
        'nm_bairro',
        'nr_latitude',
        'nr_longitude',
        'ds_cargo',
        'qt_votos',
        'qt_eleitores',
        'qt_secoes',
        'pct_votos_eleitorado',
    ];

    public array $searchFields = [
        'cd_municipio',
        'nm_municipio',
        'nm_local_votacao',
        'nm_bairro',
    ];

    public array $filterFields = [
        'cd_municipio',
        'nm_municipio',
        'nr_zona',
        'nr_local_votacao',
        'nm_local_votacao',
        'ds_endereco',
        'nm_bairro',
        'nr_latitude',
        'nr_longitude',
        'ds_cargo',
        'qt_votos',
        'qt_eleitores',
        'qt_secoes',
        'pct_votos_eleitorado',
    ];
}
