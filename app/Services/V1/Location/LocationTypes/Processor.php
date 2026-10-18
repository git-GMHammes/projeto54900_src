<?php

namespace App\Services\V1\Location\LocationTypes;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Location\LocationTypes\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Location/LocationTypes — tipo (rotulo) de local.
 *
 * Tabela global (compartilhada entre empresas): leitura para qualquer sessao,
 * escrita somente admin.
 *
 * Regras:
 *  - code unico (considera excluidos, pela UNIQUE do banco) — 409.
 *  - Tipo em uso por algum local nao e excluido (logica ou definitiva) — 409.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        return $this->codeConflict((string) ($data['code'] ?? ''));
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        return array_key_exists('code', $data) ? $this->codeConflict((string) $data['code'], $id) : null;
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        return $this->adminOnly() ?? parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        return $this->adminOnly() ?? parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        return $this->adminOnly() ?? $this->inUse($id) ?? parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        return $this->adminOnly() ?? parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        return $this->inUse($id) ?? parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return ['affected' => 0];
        }

        return parent::clearDeleted($id);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    private function adminOnly(): ?array
    {
        return CurrentUser::isAdmin()
            ? null
            : ['success' => false, 'message' => 'Somente admin altera tipos de local', 'code' => 403];
    }

    /** Quantidade de locais (de qualquer empresa, inclusive excluidos) que usam o tipo. */
    private function inUse(int $id): ?array
    {
        $count = db_connect(DB_GROUP_001)
            ->table('location_manager')
            ->where('location_type_id', $id)
            ->countAllResults();

        return $count > 0
            ? ['success' => false, 'message' => "Tipo em uso por {$count} local(is)", 'code' => 409]
            : null;
    }

    private function codeConflict(string $code, ?int $excludeId = null): ?array
    {
        if ($code === '') {
            return null;
        }

        $model = $this->tableModel->withDeleted()->where('code', $code);

        if ($excludeId !== null) {
            $model->where('id !=', $excludeId);
        }

        return $model->countAllResults() > 0
            ? ['success' => false, 'message' => 'Ja existe um tipo com este code', 'code' => 409]
            : null;
    }
}
