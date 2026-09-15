<?php

namespace App\Models\V1\BootstrapIcons;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela bootstrap_icons.
 *
 * Tabela: bootstrap_icons (catalogo de icones do Bootstrap Icons, sem FK).
 * DDL: id (BIGINT PK auto), name (VARCHAR UNIQUE), codepoint (INT),
 *      is_favorite (TINYINT(1) default 0), created_at, updated_at, deleted_at.
 * Populada por Database/Seeds/BootstrapIconsSeeder.php.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'bootstrap_icons';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'name',
        'codepoint',
        'is_favorite',
    ];

    protected array $likeFields = [
        'name',
    ];

    protected array $sortableFields = [
        'id',
        'name',
        'codepoint',
        'is_favorite',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'name',
    ];

    /**
     * Alias semantico sobre existsByField para a coluna name.
     *
     * @param string   $name      Nome do icone a verificar
     * @param int|null $excludeId ID a ignorar (usado no update)
     */
    public function existsByName(string $name, ?int $excludeId = null): bool
    {
        return $this->existsByField('name', $name, $excludeId);
    }
}
