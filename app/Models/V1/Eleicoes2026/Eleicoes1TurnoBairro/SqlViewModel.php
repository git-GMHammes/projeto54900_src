<?php

namespace App\Models\V1\Eleicoes2026\Eleicoes1TurnoBairro;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_eleicoes_2026_1_turno_bairro — secao eleitoral x municipio x bairro (1o turno 2026).
 *
 * Sem coluna id: a chave e cd_municipio_zona_secao (texto com pontos, ex.: 58696.027.0149), por isso
 * nao ha rota get/(:num). Sem company_id: catalogo global, acesso restrito a admin.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_eleicoes_2026_1_turno_bairro';
    protected $primaryKey = 'cd_municipio_zona_secao';

    protected array $likeFields = [
        'cd_municipio_zona_secao',
        'cd_municipio',
        'nm_municipio',
        'nm_bairro',
    ];

    protected array $sortableFields = [
        'cd_municipio_zona_secao',
        'cd_municipio',
        'nm_municipio',
        'nm_bairro',
    ];

    public array $searchFields = [
        'cd_municipio_zona_secao',
        'cd_municipio',
        'nm_municipio',
        'nm_bairro',
    ];

    public array $filterFields = [
        'cd_municipio',
        'nm_municipio',
        'nm_bairro',
    ];
}
