<?php

namespace App\Models\V1\Eleicoes2026\DashEleitoradoMunicipio;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_dash_eleitorado_municipio — Eleitorado por municipio.
 *
 * Sem coluna id e sem chave unica. Sem company_id: catalogo global, leitura pelo token especial das Eleicoes ou admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_dash_eleitorado_municipio';
    protected $primaryKey = 'cd_municipio';

    protected array $likeFields = [
        'cd_municipio',
        'nm_municipio',
    ];

    protected array $sortableFields = [
        'cd_municipio',
        'nm_municipio',
        'qt_eleitores',
        'qt_eleitores_federal',
        'qt_eleitores_estadual',
        'qt_eleitores_municipal',
        'qt_secoes',
        'qt_locais_votacao',
        'qt_zonas',
        'qt_bairros',
        'pct_eleitorado_estado',
    ];

    public array $searchFields = [
        'cd_municipio',
        'nm_municipio',
    ];

    public array $filterFields = [
        'cd_municipio',
        'nm_municipio',
        'qt_eleitores',
        'qt_eleitores_federal',
        'qt_eleitores_estadual',
        'qt_eleitores_municipal',
        'qt_secoes',
        'qt_locais_votacao',
        'qt_zonas',
        'qt_bairros',
        'pct_eleitorado_estado',
    ];
}
