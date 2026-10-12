<?php

namespace App\Services\V1\Map\MapAddresses;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Map\MapAddresses\SqlTableModel;
use App\Models\V1\Map\MapAddresses\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Map/MapAddresses — endereco estruturado e georreferenciado.
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
        return $this->addressError($data);
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $existing = $this->tableModel->find($id) ?? [];

        return $this->addressError(array_merge($existing, $data));
    }

    private function addressError(array $data): ?array
    {
        $cep = $data['cep'] ?? null;

        if ($cep !== null && $cep !== '' && !preg_match('/^\d{8}$/', (string) $cep)) {
            return $this->invalid('CEP invalido: informe 8 digitos');
        }

        return $this->coordPairError($data);
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

    private function invalid(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 422];
    }
}
