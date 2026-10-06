<?php

namespace App\Services\V1\Messages\MessageAttachments;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessageAttachments\SqlTableModel;
use App\Models\V1\Messages\MessageAttachments\SqlViewModel;
use App\Services\V1\BaseTableService;
use CodeIgniter\HTTP\Files\UploadedFile;

/**
 * Service de negocio do modulo Messages/MessageAttachments — anexo da mensagem (privada ou
 * de grupo; ambas sao linhas de messages_manager).
 *
 * Regras (espelho de ChatRoomAttachments, com a regra da AREA ADMINISTRATIVA IRRESTRITA):
 *  - Guest nao escreve (403).
 *  - A mensagem precisa existir (404) e ser visivel ao usuario (senao 404). So o remetente
 *    da mensagem ou admin anexa/edita/exclui (403 para os demais), em QUALQUER status da
 *    mensagem — a restricao de estado e do modo chat (README_modulo_messages.md §0).
 *  - O binario vai para writable/uploads/message_attachments/<messages_manager_id>/ e os
 *    metadados para message_attachments (StorageManager local, isolado do modulo Upload).
 *  - `replace=1` no create troca o anexo atual: os anexos ativos anteriores da mensagem
 *    sofrem soft delete (o arquivo em disco e preservado ate o delete-hard/clear-deleted).
 *  - Visibilidade (tabela, view, serve/download): a da mensagem — o remetente, o destinatario
 *    (so `sent`), o dono do grupo, o membro ativo do grupo (so `sent`) e admin. Anexo
 *    `blocked`/`inactive`: so admin baixa. Fora da regra a linha "nao existe" (404).
 *  - delete-soft preserva o arquivo; delete-hard e clear-deleted apagam o binario.
 *  - `view_message_attachments.deleted_at` tambem fica preenchido quando a mensagem foi
 *    excluida (o anexo some das leituras normais).
 *  - update so edita metadados (category/status); arquivo e vinculo sao imutaveis.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private StorageManager $storage;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
        $this->storage    = new StorageManager();
    }

    // -------------------------------------------------------------------------
    // Create multipart — grava o arquivo e registra os metadados
    // -------------------------------------------------------------------------

    public function store(array $data, ?UploadedFile $file): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $messageId = (int) ($data['messages_manager_id'] ?? 0);
        $message   = $messageId > 0 ? $this->tableModel->findMessage($messageId) : null;

        if ($message === null || $message['deleted_at'] !== null || !$this->canSeeMessage($message)) {
            return $this->notFound('Mensagem nao encontrada');
        }

        if (!$this->isMessageSender($message)) {
            return $this->forbidden('Somente o remetente da mensagem pode anexar arquivo');
        }

        if ($file === null || !$file->isValid()) {
            return $this->invalid('Envie o arquivo no campo file');
        }

        $extension = strtolower((string) ($file->getClientExtension() ?: $file->getExtension()));

        if (!$this->storage->isAllowedExtension($extension)) {
            return $this->invalid('Extensao nao permitida para anexo' . ($extension !== '' ? ': ' . $extension : ''));
        }

        $mime = (string) $file->getClientMimeType();

        if (!$this->storage->isAllowedMime($mime)) {
            return $this->invalid('Tipo de arquivo nao permitido: ' . $mime);
        }

        $category = $data['category'] ?? $this->storage->categorize($mime, $extension);
        $maxBytes = $this->storage->maxSizeKb($category) * 1024;

        if ((int) $file->getSize() > $maxBytes) {
            return $this->invalid('Arquivo maior que o limite da categoria ' . $category);
        }

        $fileKey  = $this->storage->generateKey();
        $physical = $this->storage->persist($file, $messageId, $fileKey, $extension);

        $row = [
            'messages_manager_id' => $messageId,
            'file_key'            => $fileKey,
            'original_name'       => (string) $file->getClientName(),
            'stored_name'         => $physical['stored_name'],
            'storage_path'        => $physical['storage_path'],
            'file_url'            => '',
            'mime_type'           => $mime,
            'extension'           => $extension,
            'file_size'           => $physical['size'],
            'checksum_sha256'     => $physical['checksum'] !== '' ? $physical['checksum'] : null,
            'category'            => $category,
            'status'              => (string) ($data['status'] ?? 'active'),
        ];

        $result = parent::create($row);

        if (!$result['success']) {
            // Falhou ao registrar: o binario nao pode ficar orfao no disco.
            $this->storage->remove($physical['storage_path']);

            return $result;
        }

        // file_url so existe depois do id: aponta para a rota de serve.
        $id = (int) ($result['data']['id'] ?? 0);
        if ($id > 0) {
            helper('url');
            $this->tableModel->update($id, ['file_url' => site_url('api/v1/message-attachments/serve/' . $id)]);

            if (($data['replace'] ?? '0') === '1' || ($data['replace'] ?? null) === 1) {
                $this->tableModel->softDeleteOthers($messageId, $id);
            }

            $result['data'] = $this->tableModel->find($id);
        }

        return $result;
    }

    // -------------------------------------------------------------------------
    // Servir arquivo (GET /serve/{id}, GET /download/{id})
    // -------------------------------------------------------------------------

    /**
     * Resolve o arquivo fisico de um anexo visivel ao usuario e nao excluido. Anexo
     * `blocked`/`inactive`: so admin.
     *
     * @return array{row: array, abs_path: string}|null
     */
    public function resolvePhysical(int $id): ?array
    {
        $row = $this->tableModel->find($id);

        if (!$row) {
            return null;
        }

        $message = $this->tableModel->findMessage((int) $row['messages_manager_id']);
        if ($message === null || $message['deleted_at'] !== null || !$this->canSeeMessage($message)) {
            return null;
        }

        if (($row['status'] ?? 'active') !== 'active' && !CurrentUser::isAdmin()) {
            return null;
        }

        $abs = $this->storage->absoluteFromRelative((string) $row['storage_path']);

        if (!is_file($abs)) {
            return null;
        }

        return ['row' => $row, 'abs_path' => $abs];
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function prepareUpdateData(int $id, array $data): array
    {
        // O update edita metadados; arquivo e vinculo com a mensagem sao imutaveis.
        foreach ([
            'messages_manager_id', 'file_key', 'original_name', 'stored_name', 'storage_path',
            'file_url', 'mime_type', 'extension', 'file_size', 'checksum_sha256',
        ] as $campo) {
            unset($data[$campo]);
        }

        return $data;
    }

    // -------------------------------------------------------------------------
    // Escrita — remetente da mensagem ou admin
    // -------------------------------------------------------------------------

    public function update(int $id, array $data): array
    {
        $guarded = $this->guardWrite($id, false);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        $guarded = $this->guardWrite($id, false);
        if ($guarded !== null) {
            return $guarded;
        }

        // A exclusao logica preserva o arquivo em disco.
        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        $guarded = $this->guardWrite($id, true);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        $guarded = $this->guardWrite($id, true);
        if ($guarded !== null) {
            return $guarded;
        }

        $row  = $this->tableModel->findWithDeleted($id);
        $path = is_array($row) ? (string) ($row['storage_path'] ?? '') : '';

        $result = parent::deleteHard($id);

        if ($result['success'] && $path !== '') {
            $this->storage->remove($path);
        }

        return $result;
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode limpar registros excluidos');
        }

        $paths = [];

        if ($id !== null) {
            $row = $this->tableModel->findWithDeleted($id);
            if (is_array($row)) {
                $paths[] = (string) ($row['storage_path'] ?? '');
            }
        } else {
            $deleted = $this->tableModel->findDeletedPaginated(1, 100000, 'id', 'asc');
            foreach ($deleted['data'] as $row) {
                $paths[] = (string) ($row['storage_path'] ?? '');
            }
        }

        $result = parent::clearDeleted($id);

        if (($result['affected'] ?? 0) > 0) {
            foreach ($paths as $path) {
                if ($path !== '') {
                    $this->storage->remove($path);
                }
            }
        }

        return $result;
    }

    // -------------------------------------------------------------------------
    // Leitura — Tabela restrita a quem ve a mensagem
    // -------------------------------------------------------------------------

    public function find(array $filters, array $params): array
    {
        $ids = $this->visibleIds();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findPaginated($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    public function getGrouped(array $multiFilters, array $params): array
    {
        $ids = $this->visibleIds();
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
        $ids = $this->visibleIds();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->searchByTerm($term, $this->tableModel->searchFields, $p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    public function get(int $id): ?array
    {
        return $this->visibleOrNull(parent::get($id));
    }

    public function getAll(array $params): array
    {
        $ids = $this->visibleIds();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findPaginated([], $p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    public function getNoPagination(string $sort, string $order, ?int $limit = null): array
    {
        $ids = $this->visibleIds();
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
        $ids = $this->visibleIds();
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

        $ids = $this->visibleIds();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findAllWithDeletedPaginated($p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    // -------------------------------------------------------------------------
    // Leitura — View restrita (mesma regra, via Closure de escopo)
    // -------------------------------------------------------------------------

    public function findView(array $filters, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    public function getGroupedView(array $multiFilters, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findGroupedView($this->removeMasks($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    public function searchView(string $term, array $params, array $filters = []): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->searchByTermView($term, $p['page'], $p['limit'], $p['sort'], $p['order'], $filters, $this->viewScope());
    }

    public function getView(int $id): ?array
    {
        return $this->visibleViewRowOrNull($this->viewModel->findById($id));
    }

    public function getAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView([], $p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    public function getNoPaginationView(string $sort, string $order, ?int $limit = null): array
    {
        return $this->viewModel->findAllView($sort, $order, $limit, $this->viewScope());
    }

    public function getDeletedView(int $id): ?array
    {
        return $this->visibleViewRowOrNull($this->viewModel->findDeletedById($id));
    }

    public function getDeletedAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    public function getAllWithDeletedView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findAllWithDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    /** Ids de anexos visiveis ao usuario da sessao; null = admin (sem restricao). */
    private function visibleIds(): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        return $this->tableModel->findVisibleIds((int) CurrentUser::id());
    }

    private function isMessageSender(array $message): bool
    {
        return CurrentUser::isAdmin() || (int) ($message['sender_user_manager_id'] ?? 0) === (int) CurrentUser::id();
    }

    /** O usuario da sessao enxerga a mensagem? (remetente, destinatario/membro so `sent`, dono do grupo, admin) */
    private function canSeeMessage(array $message): bool
    {
        if (CurrentUser::isAdmin()) {
            return true;
        }

        $me = (int) CurrentUser::id();
        if ((int) $message['sender_user_manager_id'] === $me) {
            return true;
        }

        $group = $this->tableModel->findMessageGroup((int) $message['id']);
        if ($group !== null && (int) $group['owner_id'] === $me) {
            return true;
        }

        if ($message['status'] !== 'sent') {
            return false;
        }

        if ((int) ($message['recipient_user_manager_id'] ?? 0) === $me) {
            return true;
        }

        return $group !== null && $this->tableModel->isActiveMember((int) $group['group_id'], $me);
    }

    /** Anexo fora da regra de visibilidade "nao existe" (404). */
    private function visibleOrNull(?array $row): ?array
    {
        if ($row === null || CurrentUser::isAdmin()) {
            return $row;
        }

        $message = $this->tableModel->findMessage((int) $row['messages_manager_id']);

        return $message !== null && $this->canSeeMessage($message) ? $row : null;
    }

    /** Escopo da view: remetente, dono do grupo, destinatario/membro ativo (so `sent`). Admin sem escopo. */
    private function viewScope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $me = (int) CurrentUser::id();

        return static function (object $builder) use ($me): void {
            $builder->groupStart()
                ->where('mm_sender_user_manager_id', $me)
                ->orWhere('mg_owner_user_manager_id', $me)
                ->orWhere(
                    "(mm_status = 'sent' AND (mm_recipient_user_manager_id = " . $me
                    . " OR mgl_message_groups_manager_id IN (SELECT message_groups_manager_id FROM message_group_members WHERE user_manager_id = " . $me
                    . " AND status = 'active' AND deleted_at IS NULL)))",
                    null,
                    false
                )
            ->groupEnd();
        };
    }

    private function visibleViewRowOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        $message = $this->tableModel->findMessage((int) ($record['mat_messages_manager_id'] ?? 0));

        return $message !== null && $this->canSeeMessage($message) ? $record : null;
    }

    /** Escrita (update/delete-*): guest 403; exige remetente da mensagem ou admin; quem nem ve = 404. */
    private function guardWrite(int $id, bool $includeDeleted): ?array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        if (CurrentUser::isAdmin()) {
            return null;
        }

        $row = $includeDeleted ? $this->tableModel->findWithDeleted($id) : $this->tableModel->find($id);
        if ($row === null) {
            return $this->notFound();
        }

        $message = $this->tableModel->findMessage((int) $row['messages_manager_id']);
        if ($message === null || !$this->canSeeMessage($message)) {
            return $this->notFound();
        }

        if (!$this->isMessageSender($message)) {
            return $this->forbidden('Somente o remetente da mensagem pode alterar ou excluir o anexo');
        }

        return null;
    }

    /** Estrutura paginada vazia — usada quando o usuario nao enxerga nenhum anexo. */
    private function emptyPaginated(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return [
            'data'       => [],
            'pagination' => ['page' => $p['page'], 'limit' => $p['limit'], 'total' => 0, 'pages' => 0],
        ];
    }

    private function forbidden(string $message = 'Operacao nao permitida para este usuario'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 403];
    }

    private function notFound(string $message = 'Registro nao encontrado ou foi excluido'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 404];
    }

    private function invalid(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 422];
    }
}
