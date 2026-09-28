<?php

namespace App\Services\V1\Timeline\TimelinePostAttachments;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Timeline\TimelinePostAttachments\SqlTableModel;
use App\Models\V1\Timeline\TimelinePostAttachments\SqlViewModel;
use App\Models\V1\Timeline\TimelinePosts\SqlTableModel as TimelinePostsModel;
use App\Services\V1\BaseTableService;
use CodeIgniter\HTTP\Files\UploadedFile;

/**
 * Service de negocio do modulo Timeline/TimelinePostAttachments — anexo do post.
 *
 * Regras (§4 do markdown do modulo):
 *  - Guest nao escreve (403).
 *  - So o dono da publicacao anexa arquivo (9) -> 403 para os demais.
 *  - O binario vai para writable/uploads/timeline_posts/<post_id>/ e os
 *    metadados para timeline_post_attachments (StorageManager local, isolado do
 *    modulo Upload).
 *  - delete-soft e logico e NAO apaga o arquivo (10); delete-hard e
 *    clear-deleted apagam o binario.
 *  - UM anexo por publicacao (decisao do usuario, 2026-09-28): se o post ja tem
 *    anexo nao excluido, o store responde 409 antes de gravar o binario.
 *  - serve/download (EndpointUpload.php, fora do contrato de 18 rotas) usam
 *    resolvePhysical(); file_url e preenchido apos o insert com a URL de serve.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private TimelinePostsModel $postsModel;
    private StorageManager $storage;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
        $this->postsModel = new TimelinePostsModel();
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

        $postId = (int) ($data['timeline_post_id'] ?? 0);
        $post   = $postId > 0 ? $this->postsModel->find($postId) : null;

        if ($post === null) {
            return $this->notFound('Publicacao nao encontrada');
        }

        if (!$this->isPostOwner($post)) {
            return $this->forbidden('Somente o dono da publicacao pode anexar arquivo');
        }

        // Regra: 1 anexo por publicacao (soft delete ja fica de fora da contagem).
        if ($this->tableModel->where('timeline_post_id', $postId)->countAllResults() > 0) {
            return ['success' => false, 'message' => 'Esta publicacao ja tem um anexo', 'code' => 409];
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

        $category = $this->storage->categorize($mime, $extension);
        $maxBytes = $this->storage->maxSizeKb($category) * 1024;

        if ((int) $file->getSize() > $maxBytes) {
            return $this->invalid('Arquivo maior que o limite da categoria ' . $category);
        }

        $fileKey  = $this->storage->generateKey();
        $physical = $this->storage->persist($file, $postId, $fileKey, $extension);

        $row = [
            'timeline_post_id' => $postId,
            'file_key'         => $fileKey,
            'original_name'    => (string) $file->getClientName(),
            'stored_name'      => $physical['stored_name'],
            'storage_path'     => $physical['storage_path'],
            'file_url'         => '',
            'mime_type'        => $mime,
            'extension'        => $extension,
            'file_size'        => $physical['size'],
            'checksum_sha256'  => $physical['checksum'] !== '' ? $physical['checksum'] : null,
            'category'         => $category,
            'title'            => $data['title'] ?? null,
            'description'      => $data['description'] ?? null,
            'sort_order'       => (int) ($data['sort_order'] ?? 0),
            'status'           => (string) ($data['status'] ?? 'active'),
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
            $this->tableModel->update($id, ['file_url' => site_url('api/v1/timeline-post-attachments/serve/' . $id)]);
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
        // O update edita metadados; arquivo e vinculo com o post sao imutaveis.
        foreach ([
            'timeline_post_id', 'file_key', 'original_name', 'stored_name', 'storage_path',
            'file_url', 'mime_type', 'extension', 'file_size', 'checksum_sha256', 'category',
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

        $guarded = $this->assertOwner($id);
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

        $guarded = $this->assertOwner($id);
        if ($guarded !== null) {
            return $guarded;
        }

        // Regra 10: a exclusao logica preserva o arquivo em disco.
        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertOwner($id, true);
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

        $guarded = $this->assertOwner($id, true);
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

    private function isPostOwner(array $post): bool
    {
        return CurrentUser::isAdmin()
            || (int) ($post['user_manager_id'] ?? 0) === (int) CurrentUser::id();
    }

    private function assertOwner(int $id, bool $includeDeleted = false): ?array
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

        $post = $this->postsModel->findWithDeleted((int) ($existing['timeline_post_id'] ?? 0));

        if (!is_array($post) || (int) ($post['user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return $this->notFound();
        }

        return null;
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
