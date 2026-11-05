<?php

namespace App\Models\V1\Eleicoes2026\Eleitorado1TurnoRj;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela eleitorado_1_turno_2026_RJ — eleitorado do 1o turno 2026 (RJ), por secao eleitoral.
 *
 * Somente leitura: dados importados (eleicoes 2026). Nenhuma coluna e gravavel pela API.
 * Sem company_id: catalogo global, acesso restrito a admin (Config/Filters.php).
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'eleitorado_1_turno_2026_RJ';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    /** Somente leitura: nada e inserido ou atualizado pela API. */
    protected $allowedFields = [];

    protected array $likeFields = [
        'ds_eleicao',
        'sg_uf',
        'cd_municipio',
        'nm_municipio',
        'nr_zona',
        'nr_secao',
        'cd_municipio_zona_secao',
        'ds_tipo_secao_agregada',
        'nm_local_votacao',
        'ds_tipo_local',
        'ds_endereco',
        'nm_bairro',
        'nr_cep',
        'nr_telefone_local',
        'ds_situ_local_votacao',
        'ds_situ_zona',
        'ds_situ_secao',
        'ds_situ_localidade',
        'ds_situ_secao_acessibilidade',
        'nm_local_votacao_original',
        'ds_endereco_locvt_original',
    ];

    protected array $sortableFields = [
        'id',
        'dt_geracao',
        'hh_geracao',
        'aa_eleicao',
        'dt_eleicao',
        'ds_eleicao',
        'nr_turno',
        'sg_uf',
        'cd_municipio',
        'nm_municipio',
        'nr_zona',
        'nr_secao',
        'cd_municipio_zona_secao',
        'cd_tipo_secao_agregada',
        'ds_tipo_secao_agregada',
        'nr_secao_principal',
        'nr_local_votacao',
        'nm_local_votacao',
        'cd_tipo_local',
        'ds_tipo_local',
        'ds_endereco',
        'nm_bairro',
        'nr_cep',
        'nr_telefone_local',
        'nr_latitude',
        'nr_longitude',
        'cd_situ_local_votacao',
        'ds_situ_local_votacao',
        'cd_situ_zona',
        'ds_situ_zona',
        'cd_situ_secao',
        'ds_situ_secao',
        'cd_situ_localidade',
        'ds_situ_localidade',
        'cd_situ_secao_acessibilidade',
        'ds_situ_secao_acessibilidade',
        'qt_eleitor_secao',
        'qt_eleitor_eleicao_federal',
        'qt_eleitor_eleicao_estadual',
        'qt_eleitor_eleicao_municipal',
        'nr_local_votacao_original',
        'nm_local_votacao_original',
        'ds_endereco_locvt_original',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public array $searchFields = [
        'cd_municipio_zona_secao',
        'nm_municipio',
        'nm_local_votacao',
        'ds_endereco',
        'nm_bairro',
        'nr_cep',
    ];
}
