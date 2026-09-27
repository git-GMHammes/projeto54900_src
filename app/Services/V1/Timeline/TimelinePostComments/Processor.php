<?php

namespace App\Services\V1\Timeline\TimelinePostComments;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Timeline\TimelinePostComments\SqlTableModel;
use App\Models\V1\Timeline\TimelinePostComments\SqlViewModel;
use App\Models\V1\Timeline\TimelinePosts\SqlTableModel as TimelinePostsModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Timeline/TimelinePostComments.
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - O post comentado precisa existir -> 404.
 *  - A resposta (parent_id) precisa ser comentario do MESMO post -> 409; e um
 *    comentario de topo tem parent_id nulo (normalizado para null).
 *  - O autor vem da sessao; editar/excluir e so do autor (admin escapa).
 *  - edited_at e carimbado pelo Processor no update de content.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private TimelinePostsModel $postsModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
        $this->postsModel = new TimelinePostsModel();
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $postId = (int) ($data['timeline_post_id'] ?? 0);
        $post   = $postId > 0 ? $this->postsModel->find($postId) : null;

        if ($post === null) {
            return $this->notFound('Publicacao nao encontrada');
        }

        $parentId = $data['parent_id'] ?? null;

        if ($parentId !== null && $parentId !== '') {
            $parent = $this->tableModel->find((int) $parentId);

            if ($parent === null) {
                return $this->notFound('Comentario respondido nao encontrado');
            }

            if ((int) ($parent['timeline_post_id'] ?? 0) !== $postId) {
                return $this->conflict('O comentario respondido e de outra publicacao');
            }
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $data['user_manager_id'] = (int) CurrentUser::id();
        $data['status']          = $data['status'] ?? 'published';

        if (!isset($data['parent_id']) || $data['parent_id'] === '' || (int) $data['parent_id'] === 0) {
            $data['parent_id'] = null;
        }

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['user_manager_id'], $data['timeline_post_id'], $data['parent_id']);

        if (array_key_exists('content', $data)) {
            $data['edited_at'] = date('Y-m-d H:i:s');
        }

        return $data;
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        return parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthor($id);
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

        $guarded = $this->assertAuthor($id);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertAuthor($id, true);
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

        $guarded = $this->assertAuthor($id, true);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode limpar registros excluidos');
        }

        return parent::clearDeleted($id);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    private function assertAuthor(int $id, bool $includeDeleted = false): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        $existing = $includeDeleted
            ? $this->tableModel->findWithDeleted($id)
            : $this->tableModel->find($id);

        if ($existing === null || (int) ($existing['user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
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

    private function conflict(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 409];
    }
}
