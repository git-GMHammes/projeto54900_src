<?php

namespace App\Services\V1\Map\MapPoints;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Map\MapPoints\SqlTableModel;
use App\Models\V1\Map\MapPoints\SqlViewModel;
use App\Models\V1\Map\MapCategories\SqlTableModel as MapCategoriesModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Map/MapPoints — pontos no mapa.
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - Limpeza de excluidos so para admin; exclusao definitiva depende do filtro
 *    adminonly das rotas.
 */
class Processor extends BaseTableService
{
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
        return $this->categoryConflict($data);
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $existing = $this->tableModel->find($id) ?? [];

        return $this->categoryConflict(array_merge($existing, $data));
    }

    /**
     * A categoria do ponto precisa pertencer ao mesmo mapa do ponto.
     */
    private function categoryConflict(array $data): ?array
    {
        $categoryId = $data['map_category_id'] ?? null;

        if ($categoryId === null || $categoryId === '' || (int) $categoryId === 0) {
            return null;
        }

        $category = (new MapCategoriesModel())->find((int) $categoryId);

        if ($category === null) {
            return ['success' => false, 'message' => 'Categoria nao encontrada', 'code' => 404];
        }

        if ((int) ($category['map_manager_id'] ?? 0) !== (int) ($data['map_manager_id'] ?? 0)) {
            return $this->conflict('A categoria pertence a outro mapa');
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        if (!isset($data['user_manager_id'])) {
            $data['user_manager_id'] = (int) CurrentUser::id();
        }

        return $this->encodeJson($data);
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        return $this->encodeJson($data);
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
     * Colunas JSON aceitam array no corpo; grava como string JSON.
     */
    private function encodeJson(array $data): array
    {
        foreach (['extra_json'] as $field) {
            if (isset($data[$field]) && is_array($data[$field])) {
                $data[$field] = json_encode($data[$field], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            }
        }

        return $data;
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
