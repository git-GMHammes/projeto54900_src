<?php

namespace App\Models\V1\Eleicoes2026\DashEleitoradoBairro;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_dash_eleitorado_bairro — Eleitorado por municipio e bairro.
 *
 * Sem coluna id e sem chave unica. Sem company_id: catalogo global, leitura pelo token especial das Eleicoes ou admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_dash_eleitorado_bairro';
    protected $primaryKey = 'cd_municipio';

    protected array $likeFields = [
        'cd_municipio',
        'nm_municipio',
        'nm_bairro',
    ];

    protected array $sortableFields = [
        'cd_municipio',
        'nm_municipio',
        'nm_bairro',
        'qt_eleitores',
        'qt_eleitores_federal',
        'qt_eleitores_estadual',
        'qt_eleitores_municipal',
        'qt_secoes',
        'qt_locais_votacao',
        'qt_zonas',
        'pct_eleitorado_estado',
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
        'qt_eleitores',
        'qt_eleitores_federal',
        'qt_eleitores_estadual',
        'qt_eleitores_municipal',
        'qt_secoes',
        'qt_locais_votacao',
        'qt_zonas',
        'pct_eleitorado_estado',
    ];
}
