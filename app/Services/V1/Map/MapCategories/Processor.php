<?php

namespace App\Services\V1\Map\MapCategories;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Map\MapCategories\SqlTableModel;
use App\Models\V1\Map\MapCategories\SqlViewModel;
use App\Services\V1\BaseTableService;
use App\Services\V1\Map\Concerns\GeneratesSlug;

/**
 * Service de negocio do modulo Map/MapCategories — categoria de ponto, por mapa.
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - Limpeza de excluidos so para admin; exclusao definitiva depende do filtro
 *    adminonly das rotas.
 */
class Processor extends BaseTableService
{
    use GeneratesSlug;

    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        // No cadastro o slug e sempre gerado/sufixado em prepareData (nao ha conflito).
        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $existing = $this->tableModel->find($id) ?? [];

        return $this->slugConflict(array_merge($existing, $data), $id);
    }

    protected function prepareData(array $data): array
    {
        $mapId        = (int) ($data['map_manager_id'] ?? 0);
        $typed        = trim((string) ($data['slug'] ?? ''));
        $data['slug'] = $this->generateSlug(
            $typed !== '' ? $typed : (string) ($data['name'] ?? ''),
            fn(string $candidate): bool => $this->taken(['map_manager_id' => $mapId, 'slug' => $candidate]),
            'categoria',
            $typed !== ''
        );

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        return $data;
    }

    private function slugConflict(array $data, ?int $excludeId = null): ?array
    {
        if ((string) ($data['slug'] ?? '') === '') {
            return null;
        }

        $taken = $this->taken([
            'map_manager_id' => (int) ($data['map_manager_id'] ?? 0),
            'slug'           => (string) ($data['slug'] ?? ''),
        ], $excludeId);

        return $taken ? $this->conflict('Ja existe uma categoria com este slug neste mapa') : null;
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        return parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        return parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        return parent::deleteRestore($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode limpar registros excluidos');
        }

        return parent::clearDeleted($id);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    /**
     * Confere duplicidade incluindo registros excluidos logicamente, porque a
     * UNIQUE do banco tambem os enxerga (evita 500 por violacao de chave).
     */
    private function taken(array $where, ?int $excludeId = null): bool
    {
        $model = $this->tableModel->withDeleted();

        foreach ($where as $field => $value) {
            $model->where($field, $value);
        }

        if ($excludeId !== null) {
            $model->where('id !=', $excludeId);
        }

        return $model->countAllResults() > 0;
    }

    private function forbidden(string $message = 'Operacao nao permitida para este usuario'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 403];
    }

    private function conflict(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 409];
    }
}
