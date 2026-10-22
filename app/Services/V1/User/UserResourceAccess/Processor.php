<?php

namespace App\Services\V1\User\UserResourceAccess;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\User\UserResourceAccess\SqlTableModel;
use App\Models\V1\User\UserResourceAccess\SqlViewModel;
use App\Services\V1\BaseTableService;
use Config\Database;

/**
 * Service de negocio do modulo User/UserResourceAccess.
 *
 * Permissao individual de um usuario a um form ou list, independente da empresa.
 *
 * Precedencia de check():
 *   1. admin                      -> libera (source 'admin')
 *   2. linha do usuario p/ recurso -> allowed 1/0 vale (source 'user')
 *   3. roles do form/list         -> perfil do usuario precisa estar na lista
 *                                    (source 'role'); roles vazio = livre p/
 *                                    qualquer autenticado (source 'open')
 * Recurso inexistente/excluido -> nega (source 'not_found').
 *
 * CRUD restrito a admin pelo filtro 'adminonly' nas rotas; check() fica em
 * rota propria (resource-access/check) so com 'jwtauth'.
 */
class Processor extends BaseTableService
{
    private const RESOURCE_TABLES = ['form' => 'form_manager', 'list' => 'list_manager'];

    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
    }

    // -------------------------------------------------------------------------
    // Verificacao de acesso
    // -------------------------------------------------------------------------

    /**
     * @return array{allowed:bool,source:string,resource_id:?int}
     */
    public function check(int $userId, string $roleSlug, string $type, ?int $resourceId, ?string $slug): array
    {
        $resource = $this->findResource($type, $resourceId, $slug);

        if ($resource === null) {
            return ['allowed' => false, 'source' => 'not_found', 'resource_id' => $resourceId];
        }

        $id = (int) $resource['id'];

        if ($roleSlug === 'admin' || $roleSlug === 'superuser') {
            return ['allowed' => true, 'source' => 'admin', 'resource_id' => $id];
        }

        $row = $this->tableModel->findByUserAndResource($userId, $type, $id);
        if ($row !== null) {
            return ['allowed' => (int) $row['allowed'] === 1, 'source' => 'user', 'resource_id' => $id];
        }

        $roles = $this->parseRoles((string) ($resource['roles'] ?? ''));
        if ($roles === []) {
            return ['allowed' => true, 'source' => 'open', 'resource_id' => $id];
        }

        return ['allowed' => in_array($roleSlug, $roles, true), 'source' => 'role', 'resource_id' => $id];
    }

    // -------------------------------------------------------------------------
    // Hooks do CRUD
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $userId = (int) ($data['user_manager_id'] ?? 0);
        $type   = (string) ($data['resource_type'] ?? '');
        $resId  = (int) ($data['resource_id'] ?? 0);

        if (!$this->db()->table('user_manager')->where('id', $userId)->where('deleted_at', null)->countAllResults()) {
            return $this->fail('Usuario nao encontrado', 404);
        }

        if ($this->findResource($type, $resId, null) === null) {
            return $this->fail('Formulario ou lista nao encontrado', 404);
        }

        if ($this->tableModel->findByUserAndResource($userId, $type, $resId) !== null) {
            return $this->fail('Ja existe permissao deste usuario para este recurso', 409);
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $data['allowed'] = (int) ($data['allowed'] ?? 1);

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        // Usuario, tipo e recurso sao a identidade da permissao: so allowed muda.
        return array_intersect_key($data, ['allowed' => true]);
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->fail('Somente admin pode limpar registros excluidos', 403);
        }

        return parent::clearDeleted($id);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    /**
     * roles e varchar: normalmente JSON (["user","admin"]), mas ha registros
     * legados com texto simples ("admin" ou "user,admin"). Vazio = sem restricao.
     *
     * @return list<string>
     */
    private function parseRoles(string $raw): array
    {
        $raw = trim($raw);

        if ($raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        $list    = is_array($decoded) ? $decoded : explode(',', $raw);

        return array_values(array_filter(array_map(static fn ($r): string => trim((string) $r), $list)));
    }

    private function findResource(string $type, ?int $id, ?string $slug): ?array
    {
        $table = self::RESOURCE_TABLES[$type] ?? null;

        if ($table === null || (($id === null || $id <= 0) && ($slug === null || $slug === ''))) {
            return null;
        }

        $builder = $this->db()->table($table)->select('id, roles')->where('deleted_at', null);

        if ($id !== null && $id > 0) {
            $builder->where('id', $id);
        } else {
            $builder->where('slug', $slug);
        }

        return $builder->get()->getRowArray();
    }

    private function fail(string $message, int $code): array
    {
        return ['success' => false, 'message' => $message, 'code' => $code];
    }

    private function db(): \CodeIgniter\Database\BaseConnection
    {
        return Database::connect(DB_GROUP_001);
    }
}
