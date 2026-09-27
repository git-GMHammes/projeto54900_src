<?php

namespace App\Services\V1\Timeline\TimelinePostReports;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Timeline\TimelinePostReports\SqlTableModel;
use App\Models\V1\Timeline\TimelinePostReports\SqlViewModel;
use App\Models\V1\Timeline\TimelinePosts\SqlTableModel as TimelinePostsModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Timeline/TimelinePostReports — denuncia e moderacao.
 *
 * Regras (§4):
 *  - Denunciar e de qualquer usuario logado (regra 7); o post precisa existir.
 *  - Uma denuncia por usuario por post -> 409 na segunda tentativa.
 *  - Os campos de moderacao (status, reviewed_by, reviewed_at, review_note) so o
 *    admin escreve: no create de quem nao e admin eles sao descartados; no
 *    update/delete a rota ja exige adminonly e o Processor reconfere (403).
 *  - Ao mudar o status pela moderacao, reviewed_by/reviewed_at sao carimbados
 *    com o admin da sessao quando nao vierem no corpo.
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

        if ($this->postsModel->find($postId) === null) {
            return $this->notFound('Publicacao nao encontrada');
        }

        $jaDenunciou = $this->tableModel->withDeleted()
            ->where('timeline_post_id', $postId)
            ->where('user_manager_id', (int) CurrentUser::id())
            ->first();

        if ($jaDenunciou !== null) {
            return $this->conflict('Voce ja denunciou esta publicacao');
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $data['user_manager_id'] = (int) CurrentUser::id();
        $data['status']          = $data['status'] ?? 'pending';

        if (!CurrentUser::isAdmin()) {
            unset($data['status'], $data['reviewed_by'], $data['reviewed_at'], $data['review_note']);
            $data['status'] = 'pending';
        }

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['user_manager_id'], $data['timeline_post_id']);

        if (array_key_exists('status', $data) && $data['status'] !== 'pending' && empty($data['reviewed_at'])) {
            $data['reviewed_at'] = date('Y-m-d H:i:s');
            $data['reviewed_by'] = (int) CurrentUser::id();
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
        if (!$this->podeModerar()) {
            return $this->forbidden('Somente admin pode moderar denuncias');
        }

        return parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        if (!$this->podeModerar()) {
            return $this->forbidden('Somente admin pode moderar denuncias');
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (!$this->podeModerar()) {
            return $this->forbidden('Somente admin pode moderar denuncias');
        }

        return parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        if (!$this->podeModerar()) {
            return $this->forbidden('Somente admin pode moderar denuncias');
        }

        return parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!$this->podeModerar()) {
            return $this->forbidden('Somente admin pode moderar denuncias');
        }

        return parent::clearDeleted($id);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    private function podeModerar(): bool
    {
        return CurrentUser::isAdmin();
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
