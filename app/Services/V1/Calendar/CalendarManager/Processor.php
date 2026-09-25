<?php

namespace App\Services\V1\Calendar\CalendarManager;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Calendar\CalendarEvents\SqlTableModel as CalendarEventsModel;
use App\Models\V1\Calendar\CalendarManager\SqlTableModel;
use App\Models\V1\Calendar\CalendarManager\SqlViewModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Calendar/CalendarManager.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - garante unicidade de google_calendar_id (quando informado) -> 409
 *  - impede o cliente de definir status no create (nasce do DEFAULT da coluna)
 *  - valida a existencia de user_manager_id (FK ativa em user_manager) quando
 *    informado -> 422. document_manager_id/map_manager_id/networking_manager_id
 *    sao FK padrao N-para-1 (varios calendarios podem apontar para o mesmo
 *    documento/mapa/mensagem) - ainda sem tabela alvo (modulos futuros), por
 *    isso sem checagem de existencia por enquanto.
 *  - restringe TODOS os metodos de leitura/escrita por perfil (ver bloco
 *    "Visibilidade por perfil"): admin sem restricao; user so enxerga/edita/
 *    apaga calendarios proprios (user_manager_id); guest so enxerga (leitura)
 *    calendarios que sejam pai de uma tarefa em que foi convidado, e recebe
 *    403 em qualquer operacao de escrita (guest nao cria/edita/apaga nada).
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;
    private UserManagerModel $userManagerModel;
    private CalendarEventsModel $calendarEventsModel;

    public function __construct()
    {
        $this->tableModel          = new SqlTableModel();
        $this->viewModel           = new SqlViewModel();
        $this->userManagerModel    = new UserManagerModel();
        $this->calendarEventsModel = new CalendarEventsModel();
    }

    // -------------------------------------------------------------------------
    // Visibilidade por perfil — leitura
    // -------------------------------------------------------------------------

    /**
     * IDs de calendarios visiveis ao usuario atual, ou null quando admin
     * (sem restricao). Guest: so calendarios-pai de tarefas em que foi
     * convidado. User (2026-09-25): calendarios proprios MAIS
     * calendarios-pai de tarefas em que foi convidado — antes so via
     * user_manager_id, entao um convite para um "user" comum (perfil mais
     * frequente do sistema, nao so guest) nunca aparecia na lista de
     * Calendarios de quem recebeu o convite.
     */
    private function idsForCurrentUser(): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        $userId = (int) CurrentUser::id();

        if (CurrentUser::roleSlug() === 'guest') {
            return $this->tableModel->findGuestInvitedCalendarIds($userId);
        }

        $ownerIds   = $this->tableModel->findOwnerIds($userId);
        $invitedIds = $this->tableModel->findGuestInvitedCalendarIds($userId);

        return array_values(array_unique([...$ownerIds, ...$invitedIds]));
    }

    /**
     * Um registro ja carregado (get/getDeleted/getWithDeleted/getAllWithDeleted)
     * "existe" para quem pediu somente se estiver dentro da regra de
     * visibilidade do perfil; caso contrario vira 404 no controller.
     */
    private function visibleOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        $userId = (int) CurrentUser::id();

        if (CurrentUser::roleSlug() === 'guest') {
            return $this->tableModel->hasInvitedEventForCalendar((int) $record['id'], $userId) ? $record : null;
        }

        if ((int) ($record['user_manager_id'] ?? 0) === $userId) {
            return $record;
        }

        return $this->tableModel->hasInvitedEventForCalendar((int) $record['id'], $userId) ? $record : null;
    }

    /** Estrutura paginada vazia — usada quando o perfil nao tem nenhum registro visivel. */
    private function emptyPaginated(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return [
            'data'       => [],
            'pagination' => ['page' => $p['page'], 'limit' => $p['limit'], 'total' => 0, 'pages' => 0],
        ];
    }

    /** Resposta de erro padrao para operacoes de escrita negadas ao perfil guest. */
    private function forbiddenWrite(): array
    {
        return ['success' => false, 'message' => 'Acao nao permitida para o perfil guest', 'code' => 403];
    }

    // -------------------------------------------------------------------------
    // Leitura — sobrescritas com restricao por perfil
    // -------------------------------------------------------------------------

    public function find(array $filters, array $params): array
    {
        $ids = $this->idsForCurrentUser();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findPaginated($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    public function getGrouped(array $multiFilters, array $params): array
    {
        $ids = $this->idsForCurrentUser();
        if ($ids !== null) {
            if (empty($ids)) {
                return $this->emptyPaginated($params);
            }
            $multiFilters['id'] = $ids;
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findGrouped($this->removeMasks($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order']);
    }

    public function search(string $term, array $params): array
    {
        $ids = $this->idsForCurrentUser();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->searchByTerm($term, $this->tableModel->searchFields, $p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    /**
     * GET /get/{id} — aplica a regra de visibilidade do perfil; um registro
     * fora da regra "nao existe" para quem pediu (404).
     */
    public function get(int $id): ?array
    {
        return $this->visibleOrNull(parent::get($id));
    }

    /**
     * GET /get-all — admin ve todos; user ve so os calendarios que possui
     * (dono, via user_manager_id); guest ve so os calendarios-pai de tarefas
     * para as quais foi convidado.
     */
    public function getAll(array $params): array
    {
        $ids = $this->idsForCurrentUser();
        if ($ids === null) {
            return parent::getAll($params);
        }
        if (empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findPaginated([], $p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    public function getNoPagination(string $sort, string $order, ?int $limit = null): array
    {
        $ids = $this->idsForCurrentUser();
        if ($ids !== null && empty($ids)) {
            return [];
        }

        return $this->tableModel->getOrdered($sort, $order, $limit, $ids);
    }

    public function getDeleted(int $id): ?array
    {
        return $this->visibleOrNull(parent::getDeleted($id));
    }

    public function getWithDeleted(int $id): ?array
    {
        return $this->visibleOrNull(parent::getWithDeleted($id));
    }

    public function getDeletedAll(array $params): array
    {
        $ids = $this->idsForCurrentUser();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findDeletedPaginated($p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    public function getAllWithDeleted(?int $id, array $params): mixed
    {
        if ($id !== null) {
            return $this->visibleOrNull($this->tableModel->findWithDeleted($id));
        }

        $ids = $this->idsForCurrentUser();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findAllWithDeletedPaginated($p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    // -------------------------------------------------------------------------
    // Leitura via VIEW (view_calendar_manager) — sobrescritas com restricao
    // -------------------------------------------------------------------------
    //
    // view_calendar_manager junta calendar_manager (prefixo cm_) com
    // calendar_events (prefixo ce_), uma linha por evento — calendario sem
    // evento vem com ce_* NULL. O `id` exposto e o do EVENTO (ce_id), nao o
    // do calendario. Restricao aplicada via Closure (BaseViewModel::$scope):
    // cm_id precisa estar entre os calendarios visiveis ao perfil, E ce_id
    // precisa ser de uma tarefa em que o usuario foi convidado OU ser NULL
    // (calendario sem evento continua visivel).

    /**
     * Closure de escopo para os metodos ...View(), ou null quando admin
     * (sem restricao). $calendarIds vem de idsForCurrentUser() — passado
     * pronto para nao recalcular em cada chamada dentro do mesmo metodo.
     */
    private function buildViewScope(array $calendarIds): \Closure
    {
        $eventIds = $this->calendarEventsModel->findInvitedIds((int) CurrentUser::id());

        return static function (object $builder) use ($calendarIds, $eventIds): void {
            $builder->whereIn('cm_id', $calendarIds);

            if (empty($eventIds)) {
                $builder->where('ce_id IS NULL', null, false);
            } else {
                $builder->groupStart()
                    ->whereIn('ce_id', $eventIds)
                    ->orWhere('ce_id IS NULL', null, false)
                    ->groupEnd();
            }
        };
    }

    /**
     * Uma linha da view ja carregada (getView/getDeletedView) "existe" para
     * quem pediu somente se o calendario (cm_id) for visivel ao perfil E a
     * tarefa (ce_id), quando presente, for uma em que o usuario foi convidado.
     */
    private function visibleViewRowOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        $calendarIds = $this->idsForCurrentUser() ?? [];
        if (!\in_array((int) $record['cm_id'], $calendarIds, true)) {
            return null;
        }

        $ceId = $record['ce_id'] ?? null;
        if ($ceId === null) {
            return $record;
        }

        $eventIds = $this->calendarEventsModel->findInvitedIds((int) CurrentUser::id());

        return \in_array((int) $ceId, $eventIds, true) ? $record : null;
    }

    public function findView(array $filters, array $params): array
    {
        $calendarIds = $this->idsForCurrentUser();
        if ($calendarIds !== null && empty($calendarIds)) {
            return $this->emptyPaginated($params);
        }

        $p     = $this->buildPaginationParams($params);
        $scope = $calendarIds !== null ? $this->buildViewScope($calendarIds) : null;

        return $this->viewModel->findPaginatedView($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $scope);
    }

    public function getGroupedView(array $multiFilters, array $params): array
    {
        $calendarIds = $this->idsForCurrentUser();
        if ($calendarIds !== null && empty($calendarIds)) {
            return $this->emptyPaginated($params);
        }

        $p     = $this->buildPaginationParams($params);
        $scope = $calendarIds !== null ? $this->buildViewScope($calendarIds) : null;

        return $this->viewModel->findGroupedView($this->removeMasks($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order'], $scope);
    }

    public function searchView(string $term, array $params, array $filters = []): array
    {
        $calendarIds = $this->idsForCurrentUser();
        if ($calendarIds !== null && empty($calendarIds)) {
            return $this->emptyPaginated($params);
        }

        $p     = $this->buildPaginationParams($params);
        $scope = $calendarIds !== null ? $this->buildViewScope($calendarIds) : null;

        return $this->viewModel->searchByTermView($term, $p['page'], $p['limit'], $p['sort'], $p['order'], $filters, $scope);
    }

    public function getView(int $id): ?array
    {
        return $this->visibleViewRowOrNull($this->viewModel->findById($id));
    }

    public function getAllView(array $params): array
    {
        $calendarIds = $this->idsForCurrentUser();
        if ($calendarIds !== null && empty($calendarIds)) {
            return $this->emptyPaginated($params);
        }

        $p     = $this->buildPaginationParams($params);
        $scope = $calendarIds !== null ? $this->buildViewScope($calendarIds) : null;

        return $this->viewModel->findPaginatedView([], $p['page'], $p['limit'], $p['sort'], $p['order'], $scope);
    }

    public function getNoPaginationView(string $sort, string $order, ?int $limit = null): array
    {
        $calendarIds = $this->idsForCurrentUser();
        if ($calendarIds !== null && empty($calendarIds)) {
            return [];
        }

        $scope = $calendarIds !== null ? $this->buildViewScope($calendarIds) : null;

        return $this->viewModel->findAllView($sort, $order, $limit, $scope);
    }

    public function getDeletedView(int $id): ?array
    {
        return $this->visibleViewRowOrNull($this->viewModel->findDeletedById($id));
    }

    public function getDeletedAllView(array $params): array
    {
        $calendarIds = $this->idsForCurrentUser();
        if ($calendarIds !== null && empty($calendarIds)) {
            return $this->emptyPaginated($params);
        }

        $p     = $this->buildPaginationParams($params);
        $scope = $calendarIds !== null ? $this->buildViewScope($calendarIds) : null;

        return $this->viewModel->findDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $scope);
    }

    public function getAllWithDeletedView(array $params): array
    {
        $calendarIds = $this->idsForCurrentUser();
        if ($calendarIds !== null && empty($calendarIds)) {
            return $this->emptyPaginated($params);
        }

        $p     = $this->buildPaginationParams($params);
        $scope = $calendarIds !== null ? $this->buildViewScope($calendarIds) : null;

        return $this->viewModel->findAllWithDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $scope);
    }

    // -------------------------------------------------------------------------
    // Escrita — sobrescritas com restricao por perfil
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbiddenWrite();
        }

        if (!CurrentUser::isAdmin()) {
            // User so pode criar calendario em seu proprio nome — ignora
            // qualquer user_manager_id enviado pelo cliente.
            $data['user_manager_id'] = CurrentUser::id();
        }

        return parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbiddenWrite();
        }

        if (!CurrentUser::isAdmin()) {
            $existing = $this->tableModel->find($id);
            if ($existing === null || (int) ($existing['user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
                return ['success' => false, 'message' => 'Registro não encontrado ou foi excluído', 'code' => 404];
            }
            // User nao pode transferir a posse do calendario para outro usuario.
            unset($data['user_manager_id']);
        }

        return parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        return $this->guardedWrite($id, fn () => parent::deleteSoft($id));
    }

    public function deleteRestore(int $id): array
    {
        return $this->guardedWrite($id, fn () => parent::deleteRestore($id), true);
    }

    public function deleteHard(int $id): array
    {
        return $this->guardedWrite($id, fn () => parent::deleteHard($id), true);
    }

    /**
     * DELETE .../clear-deleted[/{id}] — o controller le apenas $result['affected'],
     * sem checar 'success'; por isso guest/registro alheio retornam affected=0
     * (nao ha nada para sinalizar 403/404 nesse contrato de retorno).
     */
    public function clearDeleted(?int $id = null): array
    {
        if (CurrentUser::isAdmin()) {
            return parent::clearDeleted($id);
        }

        if (CurrentUser::roleSlug() === 'guest') {
            return ['affected' => 0];
        }

        $ownerIds = $this->tableModel->findOwnerIds((int) CurrentUser::id());

        if (empty($ownerIds) || ($id !== null && !\in_array($id, $ownerIds, true))) {
            return ['affected' => 0];
        }

        return ['affected' => $this->tableModel->clearDeleted($id, $ownerIds)];
    }

    /**
     * Confere que o registro existe e pertence ao usuario atual antes de
     * delegar a operacao de escrita; guest recebe 403, dono alheio recebe 404.
     */
    private function guardedWrite(int $id, callable $action, bool $includeDeleted = false): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbiddenWrite();
        }

        if (!CurrentUser::isAdmin()) {
            $existing = $includeDeleted ? $this->tableModel->findWithDeleted($id) : $this->tableModel->find($id);
            if ($existing === null || (int) ($existing['user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
                return ['success' => false, 'message' => 'Registro não encontrado', 'code' => 404];
            }
        }

        return $action();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        if (
            !empty($data['google_calendar_id'])
            && $this->tableModel->existsByGoogleCalendarId((string) $data['google_calendar_id'])
        ) {
            return ['success' => false, 'message' => 'google_calendar_id ja cadastrado', 'code' => 409];
        }

        if (!empty($data['user_manager_id']) && !$this->userManagerModel->find((int) $data['user_manager_id'])) {
            return ['success' => false, 'message' => 'user_manager_id nao encontrado', 'code' => 422];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (
            !empty($data['google_calendar_id'])
            && $this->tableModel->existsByGoogleCalendarId((string) $data['google_calendar_id'], $id)
        ) {
            return ['success' => false, 'message' => 'google_calendar_id ja cadastrado', 'code' => 409];
        }

        if (
            array_key_exists('user_manager_id', $data)
            && !empty($data['user_manager_id'])
            && !$this->userManagerModel->find((int) $data['user_manager_id'])
        ) {
            return ['success' => false, 'message' => 'user_manager_id nao encontrado', 'code' => 422];
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Hook de preparacao de dados
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        // status nunca e definido pelo cliente no create — o DEFAULT da coluna
        // ('active') decide o status de todo novo calendario.
        unset($data['status']);

        return $data;
    }

    /**
     * No update, status e mutavel: nao delega para prepareData (que faria unset).
     */
    protected function prepareUpdateData(int $id, array $data): array
    {
        return $data;
    }
}
