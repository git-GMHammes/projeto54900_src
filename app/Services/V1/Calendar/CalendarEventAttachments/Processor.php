<?php

namespace App\Services\V1\Calendar\CalendarEventAttachments;

use App\Models\V1\Calendar\CalendarEvents\SqlTableModel as CalendarEventsModel;
use App\Models\V1\Calendar\CalendarEventAttachments\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Calendar/CalendarEventAttachments.
 *
 * CRUD generico vem de BaseTableService. Este Processor valida apenas a
 * existencia de calendar_event_id (FK ativa em calendar_events).
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel     $tableModel;
    private CalendarEventsModel $eventsModel;

    public function __construct()
    {
        $this->tableModel  = new SqlTableModel();
        $this->eventsModel = new CalendarEventsModel();
    }

    protected function validateOnCreate(array $data): ?array
    {
        $eventId = (int) ($data['calendar_event_id'] ?? 0);

        if ($eventId < 1 || !$this->eventsModel->find($eventId)) {
            return ['success' => false, 'message' => 'calendar_event_id nao encontrado', 'code' => 422];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (array_key_exists('calendar_event_id', $data)) {
            $eventId = (int) $data['calendar_event_id'];
            if ($eventId < 1 || !$this->eventsModel->find($eventId)) {
                return ['success' => false, 'message' => 'calendar_event_id nao encontrado', 'code' => 422];
            }
        }

        return null;
    }
}
