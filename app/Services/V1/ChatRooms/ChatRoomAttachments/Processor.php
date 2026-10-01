<?php

namespace App\Services\V1\ChatRooms\ChatRoomAttachments;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\ChatRooms\ChatMessages\SqlTableModel as ChatMessagesModel;
use App\Models\V1\ChatRooms\ChatRoomAttachments\SqlTableModel;
use App\Models\V1\ChatRooms\ChatRoomAttachments\SqlViewModel;
use App\Models\V1\ChatRooms\ChatRoomsManager\SqlTableModel as ChatRoomsManagerModel;
use App\Services\V1\BaseTableService;
use CodeIgniter\HTTP\Files\UploadedFile;

/**
 * Service de negocio do modulo ChatRooms/ChatRoomAttachments — anexo da mensagem.
 *
 * Regras (README_modulo_chatrooms.md §2.4):
 *  - Guest nao escreve (403).
 *  - A mensagem anexada precisa existir (404). Nao ha coluna propria de
 *    uploader na tabela — a autoria e resolvida via chat_messages.user_manager_id:
 *    so o autor da mensagem (ou admin) pode anexar arquivo (403 para os demais).
 *  - O binario vai para writable/uploads/chat_messages/<chat_message_id>/ e os
 *    metadados para chat_room_attachments (StorageManager local, isolado do
 *    modulo Upload).
 *  - update/delete-soft/delete-restore/delete-hard: autor da mensagem,
 *    moderador da sala (chat_rooms_manager.owner_user_manager_id) ou admin —
 *    mesma regra usada em ChatMessages/Processor.
 *  - delete-soft e logico e NAO apaga o arquivo; delete-hard e clear-deleted
 *    apagam o binario.
 *  - Sem limite de "1 anexo por mensagem" (diferente da Timeline): nada no
 *    README do ChatRooms restringe a quantidade.
 *  - status=blocked (denuncia confirmada) e integracao futura do modulo
 *    ChatRoomAttachmentReports: quando existir, deve gravar direto via
 *    SqlTableModel::update(), sem passar pelas regras deste Processor. Por
 *    isso o UpdateRequest so aceita active/inactive.
 *  - serve/download (EndpointUpload.php, fora do contrato de 18 rotas) usam
 *    resolvePhysical(); file_url e preenchido apos o insert com a URL de serve.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private ChatMessagesModel $messagesModel;
    private ChatRoomsManagerModel $roomsModel;
    private StorageManager $storage;

    public function __construct()
    {
        $this->tableModel    = new SqlTableModel();
        $this->viewModel     = new SqlViewModel();
        $this->messagesModel = new ChatMessagesModel();
        $this->roomsModel    = new ChatRoomsManagerModel();
        $this->storage       = new StorageManager();
    }

    // -------------------------------------------------------------------------
    // Create multipart — grava o arquivo e registra os metadados
    // -------------------------------------------------------------------------

    public function store(array $data, ?UploadedFile $file): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $messageId = (int) ($data['chat_message_id'] ?? 0);
        $message   = $messageId > 0 ? $this->messagesModel->find($messageId) : null;

        if ($message === null) {
            return $this->notFound('Mensagem nao encontrada');
        }

        if (!$this->isMessageAuthor($message)) {
            return $this->forbidden('Somente o autor da mensagem pode anexar arquivo');
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
            'chat_message_id' => $messageId,
            'file_key'        => $fileKey,
            'original_name'   => (string) $file->getClientName(),
            'stored_name'     => $physical['stored_name'],
            'storage_path'    => $physical['storage_path'],
            'file_url'        => '',
            'mime_type'       => $mime,
            'extension'       => $extension,
            'file_size'       => $physical['size'],
            'checksum_sha256' => $physical['checksum'] !== '' ? $physical['checksum'] : null,
            'category'        => $category,
            'status'          => (string) ($data['status'] ?? 'active'),
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
            $this->tableModel->update($id, ['file_url' => site_url('api/v1/chat-room-attachments/serve/' . $id)]);
            $result['data'] = $this->tableModel->find($id);
        }

        return $result;
    }

    // -------------------------------------------------------------------------
    // Servir arquivo (GET /serve/{id}, GET /download/{id})
    // -------------------------------------------------------------------------

    /**
     * Resolve o arquivo fisico de um anexo ativo (status = active, nao excluido).
     *
     * @return array{row: array, abs_path: string}|null
     */
    public function resolvePhysical(int $id): ?array
    {
        $row = $this->tableModel->find($id);

        if (!$row || ($row['status'] ?? 'active') !== 'active') {
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
            'chat_message_id', 'file_key', 'original_name', 'stored_name', 'storage_path',
            'file_url', 'mime_type', 'extension', 'file_size', 'checksum_sha256',
        ] as $campo) {
            unset($data[$campo]);
        }

        return $data;
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthorOrModerator($id);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthorOrModerator($id);
        if ($guarded !== null) {
            return $guarded;
        }

        // A exclusao logica preserva o arquivo em disco.
        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthorOrModerator($id, true);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthorOrModerator($id, true);
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
    // Privados
    // -------------------------------------------------------------------------

    private function isMessageAuthor(array $message): bool
    {
        return CurrentUser::isAdmin()
            || (int) ($message['user_manager_id'] ?? 0) === (int) CurrentUser::id();
    }

    private function assertAuthorOrModerator(int $id, bool $includeDeleted = false): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        $existing = $includeDeleted
            ? $this->tableModel->findWithDeleted($id)
            : $this->tableModel->find($id);

        if ($existing === null) {
            return $this->notFound();
        }

        $message = $this->messagesModel->findWithDeleted((int) ($existing['chat_message_id'] ?? 0));

        if (!is_array($message)) {
            return $this->notFound();
        }

        $currentUserId = (int) CurrentUser::id();
        $isAuthor       = (int) ($message['user_manager_id'] ?? 0) === $currentUserId;

        if ($isAuthor) {
            return null;
        }

        $room = $this->roomsModel->find((int) ($message['chat_rooms_manager_id'] ?? 0));
        $isModerator = $room !== null && (int) ($room['owner_user_manager_id'] ?? 0) === $currentUserId;

        if ($isModerator) {
            return null;
        }

        return $this->forbidden('Somente o autor da mensagem ou o moderador da sala pode alterar ou excluir');
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
