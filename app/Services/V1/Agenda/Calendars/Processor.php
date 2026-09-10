<?php

namespace App\Services\V1\Agenda\Calendars;

use App\Models\V1\Agenda\Calendars\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Agenda/Calendars.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - garante unicidade de google_calendar_id (quando informado) -> 409
 *  - impede o cliente de definir status no create (nasce do DEFAULT da coluna)
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
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
