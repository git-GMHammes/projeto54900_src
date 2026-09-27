<?php

namespace App\Services\V1\Timeline\TimelinePostRatings;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Timeline\TimelinePostRatings\SqlTableModel;
use App\Models\V1\Timeline\TimelinePostRatings\SqlViewModel;
use App\Models\V1\Timeline\TimelinePosts\SqlTableModel as TimelinePostsModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Timeline/TimelinePostRatings — as estrelas.
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - O post precisa existir -> 404.
 *  - Nota de 1 a 5 conferida aqui tambem (regra 5): o banco nao usa CHECK.
 *  - Uma avaliacao por usuario por post (UNIQUE): avaliar de novo vira UPDATE da
 *    nota (restaurando a linha, se ela estiver soft-deleted).
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
        return $this->notaValida($data['rating'] ?? null);
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (!array_key_exists('rating', $data)) {
            return null;
        }

        return $this->notaValida($data['rating']);
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $userId = (int) CurrentUser::id();
        $postId = (int) ($data['timeline_post_id'] ?? 0);

        if ($this->postsModel->find($postId) === null) {
            return $this->notFound('Publicacao nao encontrada');
        }

        $existing = $this->findRating($postId, $userId);

        if ($existing !== null) {
            $id = (int) $existing['id'];

            $this->tableModel->update($id, ['rating' => (int) $data['rating']]);

            if (($existing['deleted_at'] ?? null) !== null) {
                $this->tableModel->restore($id);
            }

            return ['success' => true, 'data' => $this->tableModel->find($id)];
        }

        $data['user_manager_id'] = $userId;

        return parent::create($data);
    }

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

    private function notaValida(mixed $rating): ?array
    {
        if (!is_numeric($rating)) {
            return $this->invalid('Informe a nota de 1 a 5');
        }

        $nota = (int) $rating;

        if ($nota < 1 || $nota > 5) {
            return $this->invalid('A nota deve estar entre 1 e 5');
        }

        return null;
    }

    private function findRating(int $postId, int $userId): ?array
    {
        $row = $this->tableModel->withDeleted()
            ->where('timeline_post_id', $postId)
            ->where('user_manager_id', $userId)
            ->first();

        return $row === null ? null : (array) $row;
    }

    private function assertOwner(int $id, bool $includeDeleted = false): ?array
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

    private function invalid(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 422];
    }
}
