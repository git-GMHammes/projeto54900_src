<?php

namespace App\Services\V1\Calendar\CalendarEvents;

use App\Models\V1\Calendar\CalendarManager\SqlTableModel as CalendarManagerModel;
use App\Models\V1\Calendar\CalendarEvents\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Calendar/CalendarEvents.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - valida a existencia de calendar_id (FK ativa em calendar_manager)
 *  - valida a existencia de recurring_event_id (FK ativa no proprio
 *    calendar_events) quando informado; vazio -> NULL
 *  - garante unicidade de google_event_id (quando informado) -> 409
 *  - impede o cliente de definir status no create (nasce do DEFAULT da coluna)
 *  - normaliza datas: start_date/end_date (Y-m-d), start_datetime/end_datetime
 *    e google_created_at/google_updated_at (Y-m-d H:i:s)
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    private CalendarManagerModel $calendarManagerModel;

    /** @var list<string> Colunas DATE normalizadas para Y-m-d. */
    private const DATE_FIELDS = ['start_date', 'end_date'];

    /** @var list<string> Colunas DATETIME normalizadas para Y-m-d H:i:s. */
    private const DATETIME_FIELDS = ['start_datetime', 'end_datetime', 'google_created_at', 'google_updated_at'];

    public function __construct()
    {
        $this->tableModel            = new SqlTableModel();
        $this->calendarManagerModel  = new CalendarManagerModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $calendarId = (int) ($data['calendar_id'] ?? 0);

        if ($calendarId < 1 || !$this->calendarManagerModel->find($calendarId)) {
            return ['success' => false, 'message' => 'calendar_id nao encontrado', 'code' => 422];
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
            if ($calendarId < 1 || !$this->calendarManagerModel->find($calendarId)) {
                return ['success' => false, 'message' => 'calendar_id nao encontrado', 'code' => 422];
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
