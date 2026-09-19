<?php

namespace App\Services\V1\Calendar\CalendarEventAttendees;

use App\Models\V1\Calendar\CalendarEvents\SqlTableModel as CalendarEventsModel;
use App\Models\V1\Calendar\CalendarEventAttendees\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Calendar/CalendarEventAttendees.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - valida a existencia de calendar_event_id (FK ativa em calendar_events)
 *  - garante unicidade de (calendar_event_id, email) -> 409
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

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $eventId = (int) ($data['calendar_event_id'] ?? 0);

        if ($eventId < 1 || !$this->eventsModel->find($eventId)) {
            return ['success' => false, 'message' => 'calendar_event_id nao encontrado', 'code' => 422];
        }

        if (
            !empty($data['email'])
            && $this->tableModel->existsByEmailInEvent($eventId, (string) $data['email'])
        ) {
            return ['success' => false, 'message' => 'email ja convidado neste evento', 'code' => 409];
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

        $email = $data['email'] ?? $current['email'];
        if (
            !empty($email)
            && $this->tableModel->existsByEmailInEvent($eventId, (string) $email, $id)
        ) {
            return ['success' => false, 'message' => 'email ja convidado neste evento', 'code' => 409];
        }

        return null;
    }
}
