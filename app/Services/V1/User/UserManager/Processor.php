<?php

namespace App\Services\V1\User\UserManager;

use App\Models\V1\User\UserManager\SqlTableModel;
use App\Models\V1\User\UserManager\SqlViewModel;
use App\Libraries\Auth\CurrentUser;
use App\Libraries\Company\CompanyMembership;
use App\Services\V1\BaseTableService;
use App\Services\V1\Company\Companies\Processor as CompaniesProcessor;
use Config\Database;

/**
 * Service de negócio para o módulo UserManager.
 *
 * Toda a lógica genérica (leitura, escrita, exclusão) está em BaseTableService.
 * Este Processor valida unicidade de username, aplica bcrypt na senha, valida
 * user_role_id como FK ativa de user_roles.id (422) e normaliza user_role_id
 * vazio para NULL.
 *
 * Métodos: find, getGrouped, search, get, getAll, getNoPagination,
 *          getDeleted, getDeletedAll, create, update,
 *          deleteSoft, deleteRestore, deleteHard, clearDeleted
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel  $viewModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validação
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        if (!empty($data['username']) && $this->tableModel->existsByUsername($data['username'])) {
            return ['success' => false, 'message' => 'Username já cadastrado', 'code' => 409];
        }

        if ($this->userRoleInformado($data) && !$this->userRoleExiste((int) $data['user_role_id'])) {
            return ['success' => false, 'message' => 'user_role_id não encontrado em user_roles', 'code' => 422];
        }

        if (!$this->companyIdsValidos($data)) {
            return ['success' => false, 'message' => 'company_ids contém empresa inexistente', 'code' => 422];
        }

        if (!$this->companyIdsDentroDaSessao($data)) {
            return ['success' => false, 'message' => 'company_ids fora da empresa da sessão', 'code' => 403];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (!empty($data['username']) && $this->tableModel->existsByUsername($data['username'], $id)) {
            return ['success' => false, 'message' => 'Username já cadastrado', 'code' => 409];
        }

        if ($this->userRoleInformado($data) && !$this->userRoleExiste((int) $data['user_role_id'])) {
            return ['success' => false, 'message' => 'user_role_id não encontrado em user_roles', 'code' => 422];
        }

        if (!$this->companyIdsValidos($data)) {
            return ['success' => false, 'message' => 'company_ids contém empresa inexistente', 'code' => 422];
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Hook de preparação de dados
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        // Confirmação de senha só é validada no CreateRequest — não é coluna.
        unset($data['password_hash_confirm']);

        if (!empty($data['password_hash'])) {
            $data['password_hash'] = password_hash($data['password_hash'], PASSWORD_BCRYPT);
        }

        // status nunca é definido pelo cliente no create — a regra de negócio abaixo
        // (statusInicialPorEmpresas) decide o status de todo novo usuário.
        unset($data['status']);

        $data = $this->normalizeCompanyIds($data);

        // Cadastro feito por usuario logado: sem empresa informada, nasce na empresa da sessao.
        if (empty($data['company_ids']) && CurrentUser::companyId() !== null) {
            $data['company_ids'] = json_encode([CurrentUser::companyId()]);
        }

        // Em desenvolvimento (host de dev), quem nasce sem empresa entra na DEFAULT.
        if (empty($data['company_ids']) && CompaniesProcessor::isDevHost()) {
            $data['company_ids'] = json_encode([config('Company')->defaultCompanyId]);
        }

        // Cadastro feito por admin logado: ele atesta o usuario da propria empresa (nasce active e com vinculo
        // active). Cadastro publico: so a DEFAULT nasce active; qualquer outra combinacao nasce inactive e
        // com vinculo pending, a aprovar pelo admin de CADA empresa.
        $data['status'] = CurrentUser::companyId() !== null
            ? 'active'
            : $this->statusInicialPorEmpresas($data['company_ids'] ?? null);

        return $this->normalizeUserRole($data);
    }

    /**
     * Regra de negocio do cadastro: SO a empresa DEFAULT (treinamento) -> 'active', acesso
     * imediato. Qualquer outra combinacao (mais de uma empresa, ou empresa que nao seja a
     * DEFAULT, ou nenhuma) -> 'inactive': o acesso e liberado depois, por quem controla a empresa.
     */
    private function statusInicialPorEmpresas(mixed $companyIds): string
    {
        $ids = is_string($companyIds) ? json_decode($companyIds, true) : $companyIds;
        $ids = is_array($ids) ? array_values(array_unique(array_map('intval', $ids))) : [];

        return $ids === [(int) config('Company')->defaultCompanyId] ? 'active' : 'inactive';
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        if (!empty($data['password_hash'])) {
            $data['password_hash'] = password_hash($data['password_hash'], PASSWORD_BCRYPT);
        } else {
            unset($data['password_hash']);
        }

        $data = $this->normalizeCompanyIds($data);

        // Usuario logado so administra o vinculo com a PROPRIA empresa (a da sessao): as demais
        // empresas do usuario ficam como estao.
        $cid = CurrentUser::companyId();
        if ($cid !== null && array_key_exists('company_ids', $data)) {
            $row      = $this->tableModel->findWithDeleted($id);
            $existing = json_decode((string) ($row['company_ids'] ?? ''), true);
            $existing = is_array($existing) ? array_map('intval', $existing) : [];
            $wanted   = json_decode((string) ($data['company_ids'] ?? ''), true);
            $keepCid  = is_array($wanted) && in_array($cid, array_map('intval', $wanted), true);

            $merged = array_values(array_diff($existing, [$cid]));
            if ($keepCid) {
                $merged[] = $cid;
            }
            sort($merged);
            $data['company_ids'] = $merged === [] ? null : json_encode($merged);
        }

        return $this->normalizeUserRole($data);
    }

    // -------------------------------------------------------------------------
    // Reconciliacao company_ids -> company_members
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        // O usuario recem-criado ainda nao tem vinculo em company_members (nasce logo abaixo), entao
        // a leitura que o create faz da propria linha precisa rodar sem o escopo de empresa.
        $result = $this->tableModel->withoutCompanyScope(fn (): array => parent::create($data));

        if ($result['success'] ?? false) {
            $this->reconcileMembers((int) ($result['data']['id'] ?? 0), $result['data']['company_ids'] ?? null, CurrentUser::claims() === null);
        }

        return $result;
    }

    public function update(int $id, array $data): array
    {
        // Checado sobre o que o cliente ENVIOU (prepareUpdateData depois mescla as demais empresas do usuario).
        if (!$this->companyIdsDentroDaSessao($data)) {
            return ['success' => false, 'message' => 'company_ids fora da empresa da sessão', 'code' => 403];
        }

        // Aprovar/bloquear e por EMPRESA: o status enviado pelo admin da empresa muda o vinculo
        // (company_members) dele nesta empresa e nao o status global do usuario.
        $cid = CurrentUser::companyId();
        if ($cid !== null && array_key_exists('status', $data)) {
            if ($this->tableModel->find($id) === null) {
                return ['success' => false, 'message' => 'Registro não encontrado ou foi excluído', 'code' => 404];
            }

            $error = $this->changeMembershipStatus($id, $cid, (string) $data['status']);
            if ($error !== null) {
                return $error;
            }

            unset($data['status']);
            if ($data === []) {
                return ['success' => true, 'data' => $this->tableModel->find($id)];
            }
        }

        $result = parent::update($id, $data);

        if (($result['success'] ?? false) && array_key_exists('company_ids', $data)) {
            $this->reconcileMembers($id, $result['data']['company_ids'] ?? null);
        }

        return $result;
    }

    /**
     * Muda o vinculo do usuario com a empresa da sessao: active (aprovar/desbloquear), blocked ou
     * pending ('inactive' do front). Na 1a aprovacao a conta global (inactive) passa a active. O status
     * global 'blocked' (bloqueio da plataforma/auto-bloqueio) nao e alterado por aqui.
     *
     * @return array{success:bool,message:string,code:int}|null erro, ou null quando aplicado
     */
    private function changeMembershipStatus(int $userId, int $companyId, string $status): ?array
    {
        $target = $status === 'inactive' ? 'pending' : $status;

        if (!in_array($target, ['active', 'blocked', 'pending'], true)) {
            return ['success' => false, 'message' => 'Status inválido para o vínculo com a empresa', 'code' => 422];
        }

        if ($target === 'blocked' && $userId === CurrentUser::id()) {
            return ['success' => false, 'message' => 'Você não pode bloquear a si mesmo', 'code' => 422];
        }

        $db = Database::connect(DB_GROUP_001);
        $db->table('company_members')
            ->where('company_id', $companyId)
            ->where('user_manager_id', $userId)
            ->where('deleted_at', null)
            ->whereIn('status', ['pending', 'active', 'blocked'])
            ->update(['status' => $target]);

        if ($target === 'active') {
            $db->table('user_manager')->where('id', $userId)->where('status', 'inactive')->update(['status' => 'active']);
        }

        return null;
    }

    /**
     * Leva company_members para a lista gravada em company_ids (fonte de verdade: company_members).
     * $pendingNew: vinculos NOVOS de empresa que nao seja a DEFAULT nascem 'pending' (cadastro publico).
     */
    private function reconcileMembers(int $userId, mixed $companyIds, bool $pendingNew = false): void
    {
        if ($userId < 1) {
            return;
        }

        $ids = is_string($companyIds) ? json_decode($companyIds, true) : $companyIds;
        $ids = is_array($ids) ? array_values(array_unique(array_map('intval', $ids))) : [];

        $pending = $pendingNew
            ? array_values(array_diff($ids, [(int) config('Company')->defaultCompanyId]))
            : [];

        CompanyMembership::applyUserCompanyIds($userId, $ids, $pending);
    }

    // -------------------------------------------------------------------------
    // Helpers — company_ids (JSON de ids de company_manager)
    // -------------------------------------------------------------------------

    /**
     * company_ids chega como JSON string ("[1,2]") ou array; vira JSON de ints
     * unicos. Vazio/ausente-com-chave vira NULL. Chave ausente nao e tocada.
     */
    private function normalizeCompanyIds(array $data): array
    {
        if (!array_key_exists('company_ids', $data)) {
            return $data;
        }

        $raw = $data['company_ids'];
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }

        $ids = is_array($raw)
            ? array_values(array_unique(array_filter(array_map('intval', $raw), static fn (int $v): bool => $v > 0)))
            : [];

        $data['company_ids'] = $ids === [] ? null : json_encode($ids);

        return $data;
    }

    /**
     * Sessao autenticada: so pode vincular usuarios a PROPRIA empresa (a da sessao). Sem sessao
     * (cadastro publico) nao ha restricao: o usuario escolhe e nasce inactive (regra de negocio).
     */
    private function companyIdsDentroDaSessao(array $data): bool
    {
        $cid = CurrentUser::companyId();
        if ($cid === null) {
            return true;
        }

        $ids = json_decode((string) ($this->normalizeCompanyIds($data)['company_ids'] ?? ''), true);

        return !is_array($ids) || array_diff(array_map('intval', $ids), [$cid]) === [];
    }

    /** Todos os ids informados existem em company_manager (ativas, nao excluidas)? */
    private function companyIdsValidos(array $data): bool
    {
        $ids = json_decode((string) ($this->normalizeCompanyIds($data)['company_ids'] ?? ''), true);

        if (!is_array($ids) || $ids === []) {
            return true;
        }

        return Database::connect(DB_GROUP_001)
            ->table('company_manager')
            ->whereIn('id', $ids)
            ->where('deleted_at', null)
            ->countAllResults() === count($ids);
    }

    // -------------------------------------------------------------------------
    // Helpers — user_role_id (FK -> user_roles.id)
    // -------------------------------------------------------------------------

    /**
     * user_role_id vazio ('' ou 0) vira NULL — limpa o vínculo com user_roles.
     * Quando presente e válido, é normalizado para int.
     */
    private function normalizeUserRole(array $data): array
    {
        if (!array_key_exists('user_role_id', $data)) {
            return $data;
        }

        $valor = $data['user_role_id'];
        $data['user_role_id'] = ($valor === null || $valor === '' || (int) $valor < 1)
            ? null
            : (int) $valor;

        return $data;
    }

    /** true quando user_role_id veio no payload com um id > 0. */
    private function userRoleInformado(array $data): bool
    {
        return array_key_exists('user_role_id', $data)
            && $data['user_role_id'] !== null
            && $data['user_role_id'] !== ''
            && (int) $data['user_role_id'] > 0;
    }

    /** Existe um user_roles ativo (deleted_at IS NULL) com esse id? */
    private function userRoleExiste(int $id): bool
    {
        return Database::connect(DB_GROUP_001)
            ->table('user_roles')
            ->where('id', $id)
            ->where('deleted_at', null)
            ->countAllResults() > 0;
    }
}
