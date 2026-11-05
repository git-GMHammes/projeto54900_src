<?php

namespace App\Models\V1\Eleicoes2026\DashVotosBairro;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_dash_votos_bairro — Votos do candidato 22001 e eleitorado por municipio, bairro e cargo.
 *
 * Sem coluna id e sem chave unica. Sem company_id: catalogo global, leitura pelo token especial das Eleicoes ou admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_dash_votos_bairro';
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
        'qt_secoes_com_voto',
        'qt_eleitores',
        'qt_secoes',
        'pct_votos_eleitorado',
        'pct_votos_estado',
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
        'qt_secoes_com_voto',
        'qt_eleitores',
        'qt_secoes',
        'pct_votos_eleitorado',
        'pct_votos_estado',
    ];
}
