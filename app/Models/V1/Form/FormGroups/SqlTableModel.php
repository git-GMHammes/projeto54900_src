<?php

namespace App\Models\V1\Form\FormGroups;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela form_groups.
 *
 * Tabela: form_groups
 * DDL: id (BIGINT PK auto), form_manager_id (FK -> form_manager, CASCADE),
 *      title, slug (nullable; unico por form_manager_id via Processor),
 *      description, icon, sort_order (default 0), collapsed (TINYINT(1) default 0),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'form_groups';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'form_manager_id',
        'title',
        'slug',
        'description',
        'icon',
        'sort_order',
        'collapsed',
    ];

    protected array $likeFields = [
        'title',
        'slug',
    ];

    protected array $sortableFields = [
        'id',
        'form_manager_id',
        'title',
        'slug',
        'sort_order',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'title',
        'slug',
        'description',
    ];

    /**
     * Verifica se ja existe grupo com o mesmo slug dentro do mesmo formulario
     * (unicidade escopada em form_manager_id), ignorando soft-deletes e,
     * opcionalmente, um ID (para update).
     */
    public function existsBySlugInForm(int $formManagerId, string $slug, ?int $excludeId = null): bool
    {
        $builder = $this->db->table($this->table)
            ->where('form_manager_id', $formManagerId)
            ->where('slug', $slug)
            ->where($this->deletedField . ' IS NULL', null, false);

        if ($excludeId !== null) {
            $builder->where($this->primaryKey . ' !=', $excludeId);
        }

        return $builder->countAllResults() > 0;
    }
}
