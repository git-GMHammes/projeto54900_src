<?php

namespace App\Services\V1\Map\MapGeocodeCache;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Map\MapGeocodeCache\SqlTableModel;
use App\Models\V1\Map\MapGeocodeCache\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Map/MapGeocodeCache — cache de geocodificacao (politica do Nominatim exige cache).
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
        $hash = (string) ($data['query_hash'] ?? $this->hashFor($data));

        if ($this->taken(['query_hash' => $hash])) {
            return $this->conflict('Esta consulta ja esta no cache');
        }

        return $this->coordPairError($data);
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (isset($data['query_hash']) && $this->taken(['query_hash' => (string) $data['query_hash']], $id)) {
            return $this->conflict('Esta consulta ja esta no cache');
        }

        $existing = $this->tableModel->find($id) ?? [];

        return $this->coordPairError(array_merge($existing, $data));
    }

    /**
     * Hash SHA-256 da consulta normalizada (provedor + texto em minusculas).
     */
    private function hashFor(array $data): string
    {
        $provider = (string) ($data['provider'] ?? 'nominatim');
        $text     = mb_strtolower(trim((string) ($data['query_text'] ?? '')));

        return hash('sha256', $provider . '|' . $text);
    }

    protected function prepareData(array $data): array
    {
        if (!isset($data['query_hash'])) {
            $data['query_hash'] = $this->hashFor($data);
        }

        $data['provider'] = $data['provider'] ?? 'nominatim';

        return $this->encodeJson($data);
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        if (isset($data['query_text']) || isset($data['provider'])) {
            $existing = $this->tableModel->find($id) ?? [];
            $merged   = array_merge($existing, $data);

            if (!isset($data['query_hash'])) {
                $data['query_hash'] = $this->hashFor($merged);
            }
        }

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

    /**
     * Colunas JSON aceitam array no corpo; grava como string JSON.
     */
    private function encodeJson(array $data): array
    {
        foreach (['result_json'] as $field) {
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
