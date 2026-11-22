<?php

namespace App\Services\V1\Health\HealthPrescriptions;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Health\HealthRecords\SqlTableModel as RecordModel;
use App\Models\V1\Health\HealthPrescriptions\SqlTableModel;
use App\Models\V1\Health\HealthPrescriptions\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Health/HealthPrescriptions — receita e medicamento de um prontuario.
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - O prontuario e opcional (record_id pode ser NULL); quando informado, precisa existir na empresa da sessao (422).
 *  - Prontuario signed ou cancelado nao aceita inclusao, alteracao nem exclusao (409).
 *  - record_id pode ser informado ou trocado no update (validado da mesma forma).
 *  - Nenhum trigger no banco: tudo aqui.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private RecordModel $recordModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
        $this->recordModel = new RecordModel();
    }

    protected function validateOnCreate(array $data): ?array
    {
        $recordId = (int) ($data['record_id'] ?? 0);

        return $recordId > 0 ? $this->checkRecordOpen($recordId) : null;
    }

    // O prontuario e opcional: quando informado, precisa existir e estar em rascunho.
    private function checkRecordOpen(int $recordId): ?array
    {
        $record = $this->recordModel->find($recordId);

        if (!$record) {
            return $this->fail('Prontuario nao encontrado', 422);
        }

        if ($record['status'] !== 'draft') {
            return $this->fail('Prontuario assinado ou cancelado nao aceita alteracoes', 409);
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $closed = $this->recordClosed($id);

        if ($closed !== null) {
            return $closed;
        }

        $recordId = (int) ($data['record_id'] ?? 0);

        return $recordId > 0 ? $this->checkRecordOpen($recordId) : null;
    }

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        return parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        return parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        $blocked = $this->recordClosed($id);

        if ($blocked !== null) {
            return $blocked;
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        $blocked = $this->recordClosed($id);

        if ($blocked !== null) {
            return $blocked;
        }

        return parent::deleteRestore($id);
    }

    private function fail(string $message, int $code): array
    {
        return ['success' => false, 'message' => $message, 'code' => $code];
    }

    /** 409 quando o prontuario do item nao esta mais em rascunho. */
    private function recordClosed(int $id): ?array
    {
        $row = $this->tableModel->findWithDeleted($id);

        if (!$row) {
            return null;
        }

        $record = $this->recordModel->find((int) $row['record_id']);

        return ($record && $record['status'] !== 'draft')
            ? $this->fail('Prontuario assinado ou cancelado nao aceita alteracoes', 409)
            : null;
    }
/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 18:53:23
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthPrescriptions\Processor.php
BLOCO ADICIONADO - 82 linhas (229 a 310 neste arquivo editado):

// Leitura da view: guest ve so os proprios sinais vitais (paciente ligado ao seu usuario);
// admin, user e superuser veem todos os da empresa da sessao.
private function guestScope(): ?\Closure
{
if (CurrentUser::roleSlug() !== 'guest') {
return null;
}

$userId = (int) CurrentUser::id();

return static function (object $builder) use ($userId): void {
$builder->where('patient_user_id', $userId);
};
}

// Linha ja carregada: para guest, so existe se o paciente for o proprio usuario (senao 404).
private function ownRowOrNull(?array $row): ?array
{
if ($row === null || CurrentUser::roleSlug() !== 'guest') {
return $row;
}

return (int) ($row['patient_user_id'] ?? 0) === (int) CurrentUser::id() ? $row : null;
}

public function findView(array $filters, array $params): array
{
$p = $this->buildPaginationParams($params);

return $this->viewModel->findPaginatedView($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->guestScope());
}

public function getGroupedView(array $multiFilters, array $params): array
{
$p = $this->buildPaginationParams($params);

return $this->viewModel->findGroupedView($this->removeMasks($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->guestScope());
}

public function searchView(string $term, array $params, array $filters = []): array
{
$p = $this->buildPaginationParams($params);

return $this->viewModel->searchByTermView($term, $p['page'], $p['limit'], $p['sort'], $p['order'], $filters, $this->guestScope());
}

public function getView(int $id): ?array
{
return $this->ownRowOrNull($this->viewModel->findById($id));
}

public function getAllView(array $params): array
{
$p = $this->buildPaginationParams($params);

return $this->viewModel->findPaginatedView([], $p['page'], $p['limit'], $p['sort'], $p['order'], $this->guestScope());
}

public function getNoPaginationView(string $sort, string $order, ?int $limit = null): array
{
return $this->viewModel->findAllView($sort, $order, $limit, $this->guestScope());
}

public function getDeletedView(int $id): ?array
{
return $this->ownRowOrNull($this->viewModel->findDeletedById($id));
}

public function getDeletedAllView(array $params): array
{
$p = $this->buildPaginationParams($params);

return $this->viewModel->findDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->guestScope());
}

public function getAllWithDeletedView(array $params): array
{
$p = $this->buildPaginationParams($params);

return $this->viewModel->findAllWithDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->guestScope());
}
Antes de : }
Depois de : }
Motivo: guest ve so os proprios sinais vitais na leitura da view (filtro por patient_user_id); detalhe alheio vira 404.
*/

    // Leitura da view: guest ve so os proprios sinais vitais (paciente ligado ao seu usuario);
    // admin, user e superuser veem todos os da empresa da sessao.
    private function guestScope(): ?\Closure
    {
        if (CurrentUser::roleSlug() !== 'guest') {
            return null;
        }

        $userId = (int) CurrentUser::id();

        return static function (object $builder) use ($userId): void {
            $builder->where('patient_user_id', $userId);
        };
    }

    // Linha ja carregada: para guest, so existe se o paciente for o proprio usuario (senao 404).
    private function ownRowOrNull(?array $row): ?array
    {
        if ($row === null || CurrentUser::roleSlug() !== 'guest') {
            return $row;
        }

        return (int) ($row['patient_user_id'] ?? 0) === (int) CurrentUser::id() ? $row : null;
    }

    public function findView(array $filters, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->guestScope());
    }

    public function getGroupedView(array $multiFilters, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findGroupedView($this->removeMasks($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->guestScope());
    }

    public function searchView(string $term, array $params, array $filters = []): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->searchByTermView($term, $p['page'], $p['limit'], $p['sort'], $p['order'], $filters, $this->guestScope());
    }

    public function getView(int $id): ?array
    {
        return $this->ownRowOrNull($this->viewModel->findById($id));
    }

    public function getAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView([], $p['page'], $p['limit'], $p['sort'], $p['order'], $this->guestScope());
    }

    public function getNoPaginationView(string $sort, string $order, ?int $limit = null): array
    {
        return $this->viewModel->findAllView($sort, $order, $limit, $this->guestScope());
    }

    public function getDeletedView(int $id): ?array
    {
        return $this->ownRowOrNull($this->viewModel->findDeletedById($id));
    }

    public function getDeletedAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->guestScope());
    }

    public function getAllWithDeletedView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findAllWithDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->guestScope());
    }
}
