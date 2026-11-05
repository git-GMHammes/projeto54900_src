<?php

namespace App\Models\V1\Eleicoes2026\Candidato22001;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_eleicoes_2026_22001_22 — votos do candidato 22001 por secao, com os dados do local de votacao
 * (join com eleitorado_1_turno_2026_RJ).
 *
 * Sem coluna id e sem chave unica: ha varias linhas por secao (turno, cargo, partido). Por isso nao ha rota
 * get/(:num); a ordenacao padrao deve usar uma coluna da view (ex.: sort=cd_municipio_zona_secao).
 * Sem company_id: catalogo global, acesso restrito a admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_eleicoes_2026_22001_22';
    protected $primaryKey = 'cd_municipio_zona_secao';

    protected array $likeFields = [
        'cd_municipio_zona_secao',
        'eleitorado_cd_municipio_zona_secao',
        'ds_cargo',
        'sg_partido',
        'nm_municipio',
        'nm_local_votacao',
        'ds_endereco',
        'nm_bairro',
    ];

    protected array $sortableFields = [
        'cd_municipio',
        'nr_zona',
        'nr_secao',
        'cd_municipio_zona_secao',
        'ds_cargo',
        'nr_partido',
        'sg_partido',
        'qt_votos',
        'nr_turno',
        'nm_municipio',
        'eleitorado_cd_municipio_zona_secao',
        'nm_local_votacao',
        'ds_endereco',
        'nm_bairro',
        'nr_latitude',
        'nr_longitude',
        'cd_situ_local_votacao',
        'qt_eleitor_secao',
    ];

    public array $searchFields = [
        'cd_municipio_zona_secao',
        'nm_municipio',
        'nm_local_votacao',
        'ds_endereco',
        'nm_bairro',
        'sg_partido',
        'ds_cargo',
    ];

    public array $filterFields = [
        'cd_municipio',
        'nr_turno',
        'ds_cargo',
        'sg_partido',
        'nm_municipio',
        'nm_bairro',
    ];
}
