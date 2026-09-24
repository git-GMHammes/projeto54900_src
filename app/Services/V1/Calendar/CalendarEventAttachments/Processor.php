<?php

namespace App\Services\V1\Calendar\CalendarEventAttachments;

use App\Models\V1\Calendar\CalendarEvents\SqlTableModel as CalendarEventsModel;
use App\Models\V1\Calendar\CalendarEventAttachments\SqlTableModel;
use App\Models\V1\Upload\UploadManager\SqlTableModel as UploadsModel;
use App\Services\V1\BaseTableService;
use App\Services\V1\Upload\UploadManager\Processor as UploadProcessor;

/**
 * Service de negocio do modulo Calendar/CalendarEventAttachments.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - valida a existencia de calendar_event_id (FK ativa em calendar_events)
 *  - no create, exige file_id = id de um upload ativo em `uploads` com
 *    module = UPLOAD_MODULE e reference_id = o proprio evento (422), ainda nao
 *    usado por outro anexo (409); file_url (serve) e mime_type vem sempre do
 *    upload e title vazio vira o nome original do arquivo
 *  - o upload vinculado acompanha o anexo: deleteSoft/deleteRestore fazem o
 *    mesmo no upload (link serve/download para/volta); deleteHard e
 *    clearDeleted removem tambem o upload e o arquivo fisico (writable/uploads)
 *
 * O binario sobe antes, pela API propria de uploads
 * (POST /api/v1/upload-manager/upload) — esta tabela so guarda a referencia.
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, update.
 */
class Processor extends BaseTableService
{
    /** `uploads.module` dos anexos de evento (pasta writable/uploads/calendar_events/<evento>/). */
    public const UPLOAD_MODULE = 'calendar_events';

    protected SqlTableModel     $tableModel;
    private CalendarEventsModel $eventsModel;
    private UploadsModel        $uploadsModel;

    public function __construct()
    {
        $this->tableModel   = new SqlTableModel();
        $this->eventsModel  = new CalendarEventsModel();
        $this->uploadsModel = new UploadsModel();
    }

    /**
     * POST /create — antes do fluxo padrao, completa file_url/mime_type/title a
     * partir do upload (file_id). Validacao de dono do upload em validateOnCreate.
     */
    public function create(array $data): array
    {
        $upload = $this->uploadsModel->find((int) ($data['file_id'] ?? 0));

        if ($upload) {
            $data['file_url']  = (string) $upload['file_url'];
            $data['mime_type'] = $upload['mime_type'] !== null ? mb_substr((string) $upload['mime_type'], 0, 100) : null;
            if (empty($data['title'])) {
                $data['title'] = mb_substr((string) $upload['original_name'], 0, 255);
            }
        }

        return parent::create($data);
    }

    // -------------------------------------------------------------------------
    // Exclusao — o upload vinculado (file_id) acompanha o anexo
    // -------------------------------------------------------------------------

    /**
     * DELETE /delete-soft/{id} — exclusao logica do anexo e do upload vinculado:
     * o arquivo fica no disco, mas serve/download passam a responder 404.
     */
    public function deleteSoft(int $id): array
    {
        $existing = $this->tableModel->findWithDeleted($id);

        $result = parent::deleteSoft($id);

        $uploadId = (int) ($existing['file_id'] ?? 0);
        if (($result['success'] ?? false) && $uploadId > 0) {
            (new UploadProcessor())->deleteSoft($uploadId);
        }

        return $result;
    }

    /**
     * PATCH /delete-restore/{id} — restaura o anexo e o upload vinculado
     * (serve/download voltam a funcionar).
     */
    public function deleteRestore(int $id): array
    {
        $existing = $this->tableModel->findWithDeleted($id);

        $result = parent::deleteRestore($id);

        $uploadId = (int) ($existing['file_id'] ?? 0);
        if (($result['success'] ?? false) && $uploadId > 0) {
            (new UploadProcessor())->deleteRestore($uploadId);
        }

        return $result;
    }

    /**
     * DELETE /delete-hard/{id} — remove o anexo e, em seguida, o upload
     * vinculado (linha em uploads + arquivo fisico, via Processor de uploads).
     */
    public function deleteHard(int $id): array
    {
        $existing = $this->tableModel->findWithDeleted($id);

        $result = parent::deleteHard($id);

        $uploadId = (int) ($existing['file_id'] ?? 0);
        if (($result['success'] ?? false) && $uploadId > 0) {
            (new UploadProcessor())->deleteHard($uploadId);
        }

        return $result;
    }

    /**
     * DELETE /clear-deleted[/{id}] — remove de vez os anexos soft-deleted e,
     * para cada um, o upload vinculado + arquivo fisico (sem deixar orfao).
     *
     * @return array{affected: int}
     */
    public function clearDeleted(?int $id = null): array
    {
        $targets = $this->tableModel->findDeletedPaginated(1, 100000, 'id', 'asc')['data'] ?? [];

        $result = parent::clearDeleted($id);

        $uploads = new UploadProcessor();
        foreach ($targets as $row) {
            if ($id !== null && (int) $row['id'] !== $id) {
                continue;
            }
            $uploadId = (int) ($row['file_id'] ?? 0);
            if ($uploadId > 0) {
                $uploads->deleteHard($uploadId);
            }
        }

        return $result;
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

        $uploadId = (int) ($data['file_id'] ?? 0);
        $upload   = $uploadId > 0 ? $this->uploadsModel->find($uploadId) : null;

        if (
            !$upload
            || ($upload['status'] ?? 'active') !== 'active'
            || $upload['module'] !== self::UPLOAD_MODULE
            || (int) $upload['reference_id'] !== $eventId
        ) {
            return ['success' => false, 'message' => 'file_id nao e um upload ativo deste evento', 'code' => 422];
        }

        if ($this->tableModel->where('file_id', (string) $uploadId)->countAllResults() > 0) {
            return ['success' => false, 'message' => 'este upload ja esta anexado', 'code' => 409];
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
