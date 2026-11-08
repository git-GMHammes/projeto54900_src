<?php

namespace App\Models\V1\Eleicoes2026\DashResumoGeral;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_dash_resumo_geral — Resumo geral do estado: votos por cargo, eleitorado, secoes, locais, municipios, zonas e bairros.
 *
 * Sem coluna id e sem chave unica. Sem company_id: catalogo global, leitura pelo token especial das Eleicoes ou admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_dash_resumo_geral';
    protected $primaryKey = 'ds_cargo';

    protected array $likeFields = [
        'ds_cargo',
    ];

    protected array $sortableFields = [
        'ds_cargo',
        'nr_votavel',
        'qt_votos',
        'qt_secoes_com_voto',
        'qt_municipios_com_voto',
        'qt_eleitores',
        'qt_secoes',
        'qt_locais_votacao',
        'qt_municipios',
        'qt_zonas',
        'qt_bairros',
        'pct_votos_eleitorado',
    ];

    public array $searchFields = [
        'ds_cargo',
    ];

    public array $filterFields = [
        'ds_cargo',
        'nr_votavel',
        'qt_votos',
        'qt_secoes_com_voto',
        'qt_municipios_com_voto',
        'qt_eleitores',
        'qt_secoes',
        'qt_locais_votacao',
        'qt_municipios',
        'qt_zonas',
        'qt_bairros',
        'pct_votos_eleitorado',
    ];
}
