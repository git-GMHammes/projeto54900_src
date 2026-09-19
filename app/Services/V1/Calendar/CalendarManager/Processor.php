<?php

namespace App\Services\V1\Calendar\CalendarManager;

use App\Models\V1\Calendar\CalendarManager\SqlTableModel;
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
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    private UserManagerModel $userManagerModel;

    public function __construct()
    {
        $this->tableModel       = new SqlTableModel();
        $this->userManagerModel = new UserManagerModel();
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
