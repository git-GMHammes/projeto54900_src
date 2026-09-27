<?php

namespace App\Services\V1\Timeline\TimelinePostReactions;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Timeline\TimelinePostReactions\SqlTableModel;
use App\Models\V1\Timeline\TimelinePostReactions\SqlViewModel;
use App\Models\V1\Timeline\TimelinePosts\SqlTableModel as TimelinePostsModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Timeline/TimelinePostReactions.
 *
 * Regras (§4 do markdown do modulo):
 *  - Guest nao escreve (403).
 *  - O post precisa existir -> 404.
 *  - Reacao unica (regra 6): a UNIQUE timeline_post_id + user_manager_id e a
 *    rede de seguranca; aqui o segundo like do mesmo usuario NAO tenta inserir
 *    de novo — o Processor acha a linha (mesmo soft-deleted), restaura se for o
 *    caso e faz UPDATE do reaction_type.
 *  - Alternar like <-> dislike tambem pode ser feito pelo update da reacao.
 *  - Excluir/restaurar e so do dono da reacao (admin escapa).
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

        $existing = $this->findReaction($postId, $userId);

        if ($existing !== null) {
            $id = (int) $existing['id'];

            $this->tableModel->update($id, ['reaction_type' => (string) $data['reaction_type']]);

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

        $data['reaction_type'] = $data['reaction_type'] ?? null;

        if ($data['reaction_type'] === null) {
            return $this->invalid('Informe a reacao: like ou dislike');
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

    private function findReaction(int $postId, int $userId): ?array
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
