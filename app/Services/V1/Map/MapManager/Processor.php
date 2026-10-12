<?php

namespace App\Services\V1\Map\MapManager;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Map\MapManager\SqlTableModel;
use App\Models\V1\Map\MapManager\SqlViewModel;
use App\Services\V1\BaseTableService;
use App\Services\V1\Map\Concerns\GeneratesSlug;

/**
 * Service de negocio do modulo Map/MapManager — o mapa: centro, zoom e fonte de tiles.
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
        if (isset($data['slug']) && $this->taken(['slug' => (string) $data['slug']], $id)) {
            return $this->conflict('Ja existe um mapa com este slug');
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $typed        = trim((string) ($data['slug'] ?? ''));
        $data['slug'] = $this->generateSlug(
            $typed !== '' ? $typed : (string) ($data['title'] ?? ''),
            fn(string $candidate): bool => $this->taken(['slug' => $candidate]),
            'mapa',
            $typed !== ''
        );

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

    /**
     * Colunas JSON aceitam array no corpo; grava como string JSON.
     */
    private function encodeJson(array $data): array
    {
        foreach (['roles'] as $field) {
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
