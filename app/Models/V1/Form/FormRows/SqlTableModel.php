<?php

namespace App\Models\V1\Form\FormRows;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela form_rows.
 *
 * Tabela: form_rows
 * DDL: id (BIGINT PK auto), form_group_id (FK -> form_groups, CASCADE),
 *      sort_order (default 0), gutter (default 'g-3'), note,
 *      created_at, updated_at, deleted_at.
 *
 * A regra "1 a 12 campos por linha" (contagem e soma dos `col`) e verificada
 * no Services\V1\Form\FormRows\Processor, nao aqui.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'form_rows';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'form_group_id',
        'sort_order',
        'gutter',
        'note',
    ];

    protected array $likeFields = [
        'note',
    ];

    protected array $sortableFields = [
        'id',
        'form_group_id',
        'sort_order',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'note',
    ];

    /**
     * Soma dos `col` dos campos ativos ja vinculados a esta linha.
     * Usada pelo Processor para validar o teto de 12 do grid.
     */
    public function sumCampoCols(int $formRowId, ?int $excludeCampoId = null): int
    {
        $builder = $this->db->table('form_fields')
            ->selectSum('col', 'total')
            ->where('form_row_id', $formRowId)
            ->where('deleted_at IS NULL', null, false);

        if ($excludeCampoId !== null) {
            $builder->where('id !=', $excludeCampoId);
        }

        $row = $builder->get()->getRowArray();

        return (int) ($row['total'] ?? 0);
    }

    /**
     * Quantidade de campos ativos ja vinculados a esta linha.
     */
    public function countCampos(int $formRowId, ?int $excludeCampoId = null): int
    {
        $builder = $this->db->table('form_fields')
            ->where('form_row_id', $formRowId)
            ->where('deleted_at IS NULL', null, false);

        if ($excludeCampoId !== null) {
            $builder->where('id !=', $excludeCampoId);
        }

        return $builder->countAllResults();
    }
}
