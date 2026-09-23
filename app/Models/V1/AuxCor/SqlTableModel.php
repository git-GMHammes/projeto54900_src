<?php

namespace App\Models\V1\AuxCor;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela aux_cor.
 *
 * Tabela: aux_cor (catalogo de cores nomeadas, sem FK).
 * DDL: id (BIGINT PK auto), name (VARCHAR(50)), hexadecimal (VARCHAR(50)),
 *      rgb (VARCHAR(50)), created_at, updated_at, deleted_at.
 * Populada por doc/sql/insert/20260923135922_aux_cor.sql (142 cores).
 * Consumida pelo SelectField do frontend (colorKey) nos campos de cor.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'aux_cor';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'name',
        'hexadecimal',
        'rgb',
    ];

    protected array $likeFields = [
        'name',
        'hexadecimal',
    ];

    protected array $sortableFields = [
        'id',
        'name',
        'hexadecimal',
        'rgb',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'name',
        'hexadecimal',
    ];

    /**
     * Alias semantico sobre existsByField para a coluna name.
     *
     * @param string   $name      Nome da cor a verificar
     * @param int|null $excludeId ID a ignorar (usado no update)
     */
    public function existsByName(string $name, ?int $excludeId = null): bool
    {
        return $this->existsByField('name', $name, $excludeId);
    }

    /**
     * Alias semantico sobre existsByField para a coluna hexadecimal.
     *
     * @param string   $hexadecimal Codigo #RRGGBB a verificar
     * @param int|null $excludeId   ID a ignorar (usado no update)
     */
    public function existsByHexadecimal(string $hexadecimal, ?int $excludeId = null): bool
    {
        return $this->existsByField('hexadecimal', $hexadecimal, $excludeId);
    }
}
