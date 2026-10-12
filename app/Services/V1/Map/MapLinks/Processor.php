<?php

namespace App\Services\V1\Map\MapLinks;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Map\MapLinks\SqlTableModel;
use App\Models\V1\Map\MapLinks\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Map/MapLinks — vinculo universal modulo <-> mapa.
 *
 * Qualquer modulo registrado em Config\MapLinkables vincula a um registro seu
 * (module + reference_id + collection) um CEP, um endereco, um ponto ou uma
 * rota. Regras:
 *  - Guest nao escreve (403).
 *  - O modulo precisa estar registrado em Config\MapLinkables -> 422.
 *  - O registro do modulo (reference_id) precisa existir -> 404.
 *  - Exatamente um destino, coerente com link_type; os outros ficam nulos -> 422.
 *  - Vinculo repetido (mesmo registro, collection e destino) -> 409.
 *  - module, reference_id e link_type sao imutaveis no update.
 *  - Editar/excluir/restaurar so o criador (admin escapa); id alheio responde 404.
 *  - Limpeza de excluidos so admin; exclusao definitiva depende do filtro
 *    adminonly das rotas.
 */
class Processor extends BaseTableService
{
    /** link_type => coluna do destino. */
    private const TARGETS = [
        'postal_code' => 'map_postal_code_id',
        'address'     => 'map_address_id',
        'point'       => 'map_point_id',
        'route'       => 'map_route_id',
    ];

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
        $module = (string) ($data['module'] ?? '');
        $table  = $this->moduleTable($module);

        if ($table === null) {
            return $this->invalid('Modulo nao registrado em Config\\MapLinkables: ' . $module);
        }

        if (!$this->referenceExists($table, (int) ($data['reference_id'] ?? 0))) {
            return $this->notFound('Registro do modulo nao encontrado');
        }

        $type  = (string) ($data['link_type'] ?? '');
        $error = $this->targetError($type, $data);
        if ($error !== null) {
            return $error;
        }

        $column = self::TARGETS[$type];
        $dup    = $this->tableModel
            ->where('module', $module)
            ->where('reference_id', (int) $data['reference_id'])
            ->where('collection', (string) ($data['collection'] ?? 'default'))
            ->where($column, (int) $data[$column])
            ->countAllResults();

        return $dup > 0 ? $this->conflict('Este vinculo ja existe para o registro') : null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $existing = $this->tableModel->find($id);
        if ($existing === null) {
            return $this->notFound();
        }

        $type = (string) $existing['link_type'];

        foreach (self::TARGETS as $linkType => $column) {
            if ($linkType !== $type && isset($data[$column]) && $data[$column] !== null) {
                return $this->invalid('Destino incompativel com link_type ' . $type);
            }
        }

        $column = self::TARGETS[$type];

        if (array_key_exists($column, $data) && ($data[$column] === null || (int) $data[$column] === 0)) {
            return $this->invalid('O destino do vinculo nao pode ficar vazio');
        }

        if (isset($data['collection']) || isset($data[$column])) {
            $merged = array_merge($existing, $data);
            $dup    = $this->tableModel
                ->where('module', (string) $merged['module'])
                ->where('reference_id', (int) $merged['reference_id'])
                ->where('collection', (string) $merged['collection'])
                ->where($column, (int) $merged[$column])
                ->where('id !=', $id)
                ->countAllResults();

            if ($dup > 0) {
                return $this->conflict('Este vinculo ja existe para o registro');
            }
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $type = (string) ($data['link_type'] ?? '');

        foreach (self::TARGETS as $linkType => $column) {
            if ($linkType !== $type) {
                unset($data[$column]);
            }
        }

        $data['collection'] = $data['collection'] ?? 'default';
        $data['status']     = $data['status'] ?? 'active';

        if (!isset($data['user_manager_id'])) {
            $data['user_manager_id'] = (int) CurrentUser::id();
        }

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['module'], $data['reference_id'], $data['link_type'], $data['user_manager_id']);

        return $data;
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

        $guarded = $this->assertAuthor($id);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthor($id);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthor($id, true);
        if ($guarded !== null) {
            return $guarded;
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
     * Tabela do modulo registrado em Config\MapLinkables, ou null.
     */
    private function moduleTable(string $module): ?string
    {
        $modules = config('MapLinkables')->modules;

        return $modules[$module] ?? null;
    }

    private function referenceExists(string $table, int $referenceId): bool
    {
        if ($referenceId < 1) {
            return false;
        }

        $db      = \Config\Database::connect(DB_GROUP_001);
        $builder = $db->table($table)->where('id', $referenceId);

        if ($db->fieldExists('deleted_at', $table)) {
            $builder->where('deleted_at IS NULL', null, false);
        }

        // Isolamento por empresa: o link so pode apontar para registro da empresa da sessao.
        $cid = CurrentUser::companyId();
        if ($cid !== null) {
            if ($db->fieldExists('company_id', $table)) {
                $builder->where('company_id', $cid);
            } elseif (in_array($table, ['user_manager', 'user_profiles'], true)) {
                $builder->where(
                    ($table === 'user_manager' ? 'id' : 'user_manager_id') . ' IN (SELECT cm.user_manager_id FROM company_members cm WHERE cm.company_id = ' . (int) $cid
                    . " AND cm.status = 'active' AND cm.deleted_at IS NULL)",
                    null,
                    false
                );
            }
        }

        return $builder->countAllResults() > 0;
    }

    /**
     * Exatamente o destino do link_type preenchido e os demais vazios.
     */
    private function targetError(string $type, array $data): ?array
    {
        if (!isset(self::TARGETS[$type])) {
            return $this->invalid('link_type invalido');
        }

        $column = self::TARGETS[$type];

        if (empty($data[$column])) {
            return $this->invalid('Informe ' . $column . ' para link_type ' . $type);
        }

        foreach (self::TARGETS as $linkType => $other) {
            if ($linkType !== $type && !empty($data[$other])) {
                return $this->invalid('Destino ' . $other . ' incompativel com link_type ' . $type);
            }
        }

        return null;
    }

    private function assertAuthor(int $id, bool $includeDeleted = false): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        $existing = $includeDeleted
            ? $this->tableModel->findWithDeleted($id)
            : $this->tableModel->find($id);

        if ($existing === null || (int) ($existing['user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return $this->notFound();
        }

        return null;
    }

    private function forbidden(string $message = 'Operacao nao permitida para este usuario'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 403];
    }

    private function notFound(string $message = 'Registro nao encontrado ou foi excluido'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 404];
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
