<?php

namespace App\Services\V1\Calendar\CalendarEventReminders;

use App\Models\V1\Calendar\CalendarEvents\SqlTableModel as CalendarEventsModel;
use App\Models\V1\Calendar\CalendarEventReminders\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Calendar/CalendarEventReminders.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - valida a existencia de calendar_event_id (FK ativa em calendar_events)
 *  - garante unicidade de (calendar_event_id, method, minutes) -> 409
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel     $tableModel;
    private CalendarEventsModel $eventsModel;

    private const METHOD_DEFAULT = 'popup';

    public function __construct()
    {
        $this->tableModel  = new SqlTableModel();
        $this->eventsModel = new CalendarEventsModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $eventId = (int) ($data['calendar_event_id'] ?? 0);

        if ($eventId < 1 || !$this->eventsModel->find($eventId)) {
            return ['success' => false, 'message' => 'calendar_event_id nao encontrado', 'code' => 422];
        }

        $method  = !empty($data['method']) ? (string) $data['method'] : self::METHOD_DEFAULT;
        $minutes = (int) ($data['minutes'] ?? 0);

        if ($this->tableModel->existsByMethodMinutesInEvent($eventId, $method, $minutes)) {
            return ['success' => false, 'message' => 'lembrete identico (method + minutes) ja existe neste evento', 'code' => 409];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $current = $this->tableModel->find($id);
        if (!$current) {
            return null; // inexistencia e tratada por BaseTableService::update
        }

        $eventId = (int) ($data['calendar_event_id'] ?? $current['calendar_event_id']);

        if (array_key_exists('calendar_event_id', $data)) {
            if ($eventId < 1 || !$this->eventsModel->find($eventId)) {
                return ['success' => false, 'message' => 'calendar_event_id nao encontrado', 'code' => 422];
            }
        }

        $method  = (string) ($data['method'] ?? $current['method']);
        $minutes = (int) ($data['minutes'] ?? $current['minutes']);

        if ($this->tableModel->existsByMethodMinutesInEvent($eventId, $method, $minutes, $id)) {
            return ['success' => false, 'message' => 'lembrete identico (method + minutes) ja existe neste evento', 'code' => 409];
        }

        return null;
    }
}
