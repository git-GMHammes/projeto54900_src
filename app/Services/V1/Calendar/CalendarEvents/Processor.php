<?php

namespace App\Services\V1\Calendar\CalendarEvents;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Calendar\CalendarEventAttendees\SqlTableModel as CalendarEventAttendeesModel;
use App\Models\V1\Calendar\CalendarManager\SqlTableModel as CalendarManagerModel;
use App\Models\V1\Calendar\CalendarEvents\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Calendar/CalendarEvents.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - valida a existencia de calendar_id (FK ativa em calendar_manager) e, para
 *    o perfil User, que o calendario pertenca ao proprio usuario
 *  - valida a existencia de recurring_event_id (FK ativa no proprio
 *    calendar_events) quando informado; vazio -> NULL
 *  - garante unicidade de google_event_id (quando informado) -> 409
 *  - impede o cliente de definir status no create (nasce do DEFAULT da coluna)
 *  - normaliza datas: start_date/end_date (Y-m-d), start_datetime/end_datetime
 *    e google_created_at/google_updated_at (Y-m-d H:i:s)
 *  - restringe TODOS os metodos de leitura/escrita por perfil (ver bloco
 *    "Visibilidade por perfil"): admin sem restricao; leitura (User e Guest)
 *    restrita a qualquer convidado (calendar_event_attendees); escrita
 *    (update, delete-soft, delete-restore, delete-hard e clear-deleted,
 *    apenas User) restrita ao dono da tarefa (coluna propria
 *    calendar_events.user_manager_id, adicionada em 2026-09-25 — mesmo
 *    padrao de CalendarManager). Guest recebe 403 em qualquer escrita (nao
 *    cria/edita/apaga nada). Ao criar uma tarefa, o proprio User e gravado
 *    como user_manager_id E inserido automaticamente como attendee
 *    organizador, para nunca perder acesso (leitura) ao que criou.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    private CalendarManagerModel $calendarManagerModel;
    private CalendarEventAttendeesModel $attendeesModel;

    /** @var list<string> Colunas DATE normalizadas para Y-m-d. */
    private const DATE_FIELDS = ['start_date', 'end_date'];

    /** @var list<string> Colunas DATETIME normalizadas para Y-m-d H:i:s. */
    private const DATETIME_FIELDS = ['start_datetime', 'end_datetime', 'google_created_at', 'google_updated_at'];

    public function __construct()
    {
        $this->tableModel            = new SqlTableModel();
        $this->calendarManagerModel  = new CalendarManagerModel();
        $this->attendeesModel        = new CalendarEventAttendeesModel();
    }

    // -------------------------------------------------------------------------
    // Visibilidade por perfil — leitura
    // -------------------------------------------------------------------------

    /**
     * IDs de tarefas visiveis ao usuario atual (qualquer convidado), ou null
     * quando admin (sem restricao). Usado por User e Guest igualmente: a
     * leitura de tarefa e por convite, nao por autoria.
     */
    private function idsForCurrentUser(): ?array
    {
        return CurrentUser::isAdmin() ? null : $this->tableModel->findInvitedIds((int) CurrentUser::id());
    }

    /**
     * Um registro ja carregado (get/getDeleted/getWithDeleted/getAllWithDeleted)
     * "existe" para quem pediu somente se o usuario for convidado da tarefa;
     * caso contrario vira 404 no controller — tarefa nao compartilhada
     * permanece privada mesmo dentro de um calendario visivel.
     */
    private function visibleOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        return $this->attendeesModel->existsByUserInEvent((int) $record['id'], (int) CurrentUser::id()) ? $record : null;
    }

    /** Estrutura paginada vazia — usada quando o perfil nao tem nenhuma tarefa visivel. */
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
    // Leitura — sobrescritas com restricao por perfil (qualquer convidado)
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
     * GET /get/{id} — aplica a regra de visibilidade do perfil; uma tarefa
     * fora da regra "nao existe" para quem pediu (404).
     */
    public function get(int $id): ?array
    {
        return $this->visibleOrNull(parent::get($id));
    }

    /**
     * GET /get-all — admin ve todas as tarefas; user e guest veem somente as
     * tarefas em que constam como convidados (calendar_event_attendees).
     * Tarefas nao compartilhadas permanecem privadas mesmo dentro de um
     * calendario visivel.
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
    // Escrita — sobrescritas com restricao por perfil (dono da tarefa)
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbiddenWrite();
        }

        if (!CurrentUser::isAdmin()) {
            // User so pode criar tarefa em seu proprio nome — ignora qualquer
            // user_manager_id enviado pelo cliente.
            $data['user_manager_id'] = CurrentUser::id();
        }

        $result = parent::create($data);

        if ($result['success'] && !CurrentUser::isAdmin()) {
            // Sem isso, o proprio criador perderia acesso a tarefa que criou,
            // ja que a leitura de calendar-events e restrita a convidados.
            $this->autoRegisterOrganizer((int) $result['data']['id']);
        }

        return $result;
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
            // User nao pode transferir a posse da tarefa para outro usuario.
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
     * sem checar 'success'; por isso guest/tarefa alheia retornam affected=0.
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
     * Confere que o registro existe e pertence ao usuario atual (dono da
     * tarefa, user_manager_id) antes de delegar a operacao de escrita; guest
     * recebe 403, dono alheio recebe 404.
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

    /**
     * Insere o usuario atual como attendee organizador da tarefa recem-criada
     * (idempotente — nao duplica se por algum motivo ja existir). O email e
     * obrigatorio na tabela; usa-se o username do JWT como melhor fonte
     * disponivel sem consulta extra (nao ha coluna de email em user_manager).
     */
    private function autoRegisterOrganizer(int $eventId): void
    {
        $userId = (int) CurrentUser::id();

        if ($this->attendeesModel->existsByUserInEvent($eventId, $userId)) {
            return;
        }

        $username = (string) (CurrentUser::claims()['username'] ?? ('user-' . $userId));

        $this->attendeesModel->insert([
            'calendar_event_id' => $eventId,
            'user_manager_id'   => $userId,
            'email'             => $username,
            'display_name'      => $username,
            'is_organizer'      => 1,
            'is_self'           => 1,
            'response_status'   => 'accepted',
        ]);
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $calendarId = (int) ($data['calendar_id'] ?? 0);
        $calendar   = $calendarId >= 1 ? $this->calendarManagerModel->find($calendarId) : null;

        if ($calendar === null) {
            return ['success' => false, 'message' => 'calendar_id nao encontrado', 'code' => 422];
        }

        if (!CurrentUser::isAdmin() && (int) ($calendar['user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return ['success' => false, 'message' => 'calendar_id nao pertence ao usuario', 'code' => 403];
        }

        if ($this->recurringInformado($data) && !$this->tableModel->find((int) $data['recurring_event_id'])) {
            return ['success' => false, 'message' => 'recurring_event_id nao encontrado em calendar_events', 'code' => 422];
        }

        if (
            !empty($data['google_event_id'])
            && $this->tableModel->existsByGoogleEventId((string) $data['google_event_id'])
        ) {
            return ['success' => false, 'message' => 'google_event_id ja cadastrado', 'code' => 409];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (array_key_exists('calendar_id', $data)) {
            $calendarId = (int) $data['calendar_id'];
            $calendar   = $calendarId >= 1 ? $this->calendarManagerModel->find($calendarId) : null;

            if ($calendar === null) {
                return ['success' => false, 'message' => 'calendar_id nao encontrado', 'code' => 422];
            }

            if (!CurrentUser::isAdmin() && (int) ($calendar['user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
                return ['success' => false, 'message' => 'calendar_id nao pertence ao usuario', 'code' => 403];
            }
        }

        if ($this->recurringInformado($data)) {
            $recurringId = (int) $data['recurring_event_id'];
            if ($recurringId === $id) {
                return ['success' => false, 'message' => 'recurring_event_id nao pode referenciar o proprio evento', 'code' => 422];
            }
            if (!$this->tableModel->find($recurringId)) {
                return ['success' => false, 'message' => 'recurring_event_id nao encontrado em calendar_events', 'code' => 422];
            }
        }

        if (
            !empty($data['google_event_id'])
            && $this->tableModel->existsByGoogleEventId((string) $data['google_event_id'], $id)
        ) {
            return ['success' => false, 'message' => 'google_event_id ja cadastrado', 'code' => 409];
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Hooks de preparacao de dados
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        // status nunca e definido pelo cliente no create — o DEFAULT da coluna
        // ('confirmed') decide o status de todo novo evento.
        unset($data['status']);

        return $this->normalizeRecurring($this->normalizeDates($data));
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        return $this->normalizeRecurring($this->normalizeDates($data));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function normalizeDates(array $data): array
    {
        foreach (self::DATE_FIELDS as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = $this->formatDate($data[$field]);
            }
        }

        foreach (self::DATETIME_FIELDS as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = $this->formatDatetime($data[$field]);
            }
        }

        return $data;
    }

    /**
     * recurring_event_id vazio ('' ou < 1) vira NULL.
     */
    private function normalizeRecurring(array $data): array
    {
        if (!array_key_exists('recurring_event_id', $data)) {
            return $data;
        }

        $valor = $data['recurring_event_id'];
        $data['recurring_event_id'] = ($valor === null || $valor === '' || (int) $valor < 1)
            ? null
            : (int) $valor;

        return $data;
    }

    /** true quando recurring_event_id veio no payload com um id > 0. */
    private function recurringInformado(array $data): bool
    {
        return array_key_exists('recurring_event_id', $data)
            && $data['recurring_event_id'] !== null
            && $data['recurring_event_id'] !== ''
            && (int) $data['recurring_event_id'] > 0;
    }
}
