<?php

namespace App\Services\V1\Map\MapPostalCodes;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Map\MapPostalCodes\SqlTableModel;
use App\Models\V1\Map\MapPostalCodes\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Map/MapPostalCodes — base de CEP (logradouro, bairro, cidade) com coordenada.
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
        $cep = (string) ($data['cep'] ?? '');

        if (!preg_match('/^\d{8}$/', $cep)) {
            return $this->invalid('CEP invalido: informe 8 digitos');
        }

        if ($this->taken(['cep' => $cep])) {
            return $this->conflict('Este CEP ja esta cadastrado');
        }

        return $this->coordPairError($data);
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (isset($data['cep'])) {
            $cep = (string) $data['cep'];

            if (!preg_match('/^\d{8}$/', $cep)) {
                return $this->invalid('CEP invalido: informe 8 digitos');
            }

            if ($this->taken(['cep' => $cep], $id)) {
                return $this->conflict('Este CEP ja esta cadastrado');
            }
        }

        $existing = $this->tableModel->find($id) ?? [];

        return $this->coordPairError(array_merge($existing, $data));
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
     * lat e lng andam juntas: ou as duas preenchidas, ou nenhuma.
     */
    private function coordPairError(array $data): ?array
    {
        $hasLat = isset($data['lat']) && $data['lat'] !== '';
        $hasLng = isset($data['lng']) && $data['lng'] !== '';

        if ($hasLat !== $hasLng) {
            return $this->invalid('Informe lat e lng juntas');
        }

        return null;
    }

    private function forbidden(string $message = 'Operacao nao permitida para este usuario'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 403];
    }

    private function conflict(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 409];
    }

    private function invalid(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 422];
    }
}
