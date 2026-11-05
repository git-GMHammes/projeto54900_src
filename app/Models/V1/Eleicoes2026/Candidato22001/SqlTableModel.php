<?php

namespace App\Models\V1\Eleicoes2026\Candidato22001;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela eleicoes_2026_votos_1t_2t_22001_RJ — votos do candidato 22001, 1o e 2o turno 2026 (RJ), por secao.
 *
 * Somente leitura: dados importados (eleicoes 2026). Nenhuma coluna e gravavel pela API.
 * Sem company_id: catalogo global, acesso restrito a admin (Config/Filters.php).
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'eleicoes_2026_votos_1t_2t_22001_RJ';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = false;
    protected $useTimestamps  = false;

    protected $hidden = [];

    /** Somente leitura: nada e inserido ou atualizado pela API. */
    protected $allowedFields = [];

    protected array $likeFields = [
        'sg_uf',
        'cd_municipio',
        'nr_zona',
        'nr_secao',
        'cd_municipio_zona_secao',
        'ds_cargo',
        'tp_voto',
        'sg_partido',
        'nm_votavel',
    ];

    protected array $sortableFields = [
        'id',
        'sg_uf',
        'nr_turno',
        'cd_municipio',
        'nr_zona',
        'nr_secao',
        'cd_municipio_zona_secao',
        'ds_cargo',
        'tp_voto',
        'nr_partido',
        'sg_partido',
        'nr_votavel',
        'nm_votavel',
        'qt_votos',
    ];

    public array $searchFields = [
        'cd_municipio_zona_secao',
        'nm_votavel',
        'sg_partido',
        'ds_cargo',
    ];
}
