<?php

namespace App\Services\V1\Calendar\CalendarEventAttendees;

use App\Models\V1\Calendar\CalendarEvents\SqlTableModel as CalendarEventsModel;
use App\Models\V1\Calendar\CalendarEventAttendees\SqlTableModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserManagerModel;
use App\Models\V1\User\UserProfiles\SqlTableModel as UserProfilesModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Calendar/CalendarEventAttendees.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - valida a existencia de calendar_event_id (FK ativa em calendar_events)
 *  - valida a existencia de user_manager_id (FK ativa em user_manager), quando vier
 *  - no create, user_manager_id e obrigatorio e email/display_name vem sempre
 *    de user_profiles do usuario (perfil sem e-mail ou nome -> 422)
 *  - garante unicidade de (calendar_event_id, email) e de
 *    (calendar_event_id, user_manager_id) -> 409
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel     $tableModel;
    private CalendarEventsModel $eventsModel;
    private UserManagerModel    $usersModel;
    private UserProfilesModel   $profilesModel;

    public function __construct()
    {
        $this->tableModel    = new SqlTableModel();
        $this->eventsModel   = new CalendarEventsModel();
        $this->usersModel    = new UserManagerModel();
        $this->profilesModel = new UserProfilesModel();
    }

    /**
     * POST /create — antes do fluxo padrao, grava email/display_name SEMPRE a
     * partir do perfil do usuario (user_manager_id, obrigatorio): o que vier no
     * payload e ignorado, para o convite nunca divergir do usuario escolhido.
     * O frontend ja mostra os mesmos valores (fillFields, campos read_only).
     */
    public function create(array $data): array
    {
        $userId = (int) ($data['user_manager_id'] ?? 0);

        if ($userId < 1 || !$this->usersModel->find($userId)) {
            return ['success' => false, 'message' => 'user_manager_id nao encontrado', 'code' => 422];
        }

        $profile = $this->profilesModel->where('user_manager_id', $userId)->first();

        if (empty($profile['email']) || empty($profile['name'])) {
            return ['success' => false, 'message' => 'usuario sem e-mail ou nome no perfil (user_profiles)', 'code' => 422];
        }

        $data['email']        = $profile['email'];
        $data['display_name'] = $profile['name'];

        return parent::create($data);
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

        $userId = (int) ($data['user_manager_id'] ?? 0);
        if ($userId > 0) {
            if (!$this->usersModel->find($userId)) {
                return ['success' => false, 'message' => 'user_manager_id nao encontrado', 'code' => 422];
            }
            if ($this->tableModel->existsByUserInEvent($eventId, $userId)) {
                return ['success' => false, 'message' => 'usuario ja convidado neste evento', 'code' => 409];
            }
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

        $userId = (int) ($data['user_manager_id'] ?? $current['user_manager_id'] ?? 0);
        if ($userId > 0) {
            if (array_key_exists('user_manager_id', $data) && !$this->usersModel->find($userId)) {
                return ['success' => false, 'message' => 'user_manager_id nao encontrado', 'code' => 422];
            }
            if ($this->tableModel->existsByUserInEvent($eventId, $userId, $id)) {
                return ['success' => false, 'message' => 'usuario ja convidado neste evento', 'code' => 409];
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
