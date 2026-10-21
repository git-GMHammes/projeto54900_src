<?php

namespace App\Services\V1\Service\ServiceAttributes;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Service\ServiceAttributes\SqlTableModel;
use App\Models\V1\Service\ServiceAttributes\SqlViewModel;
use App\Models\V1\Service\ServiceManager\SqlTableModel as ServiceModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Service/ServiceAttributes — caracteristicas do servico.
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - O servico precisa existir na empresa da sessao (422).
 *  - Troca de servico no update nao e permitida (as linhas pertencem ao servico de origem).
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
    }

    protected function validateOnCreate(array $data): ?array
    {
        if (!(new ServiceModel())->find((int) ($data['service_id'] ?? 0))) {
            return $this->fail('Servico nao encontrado', 422);
        }

        return null;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['service_id']);

        return parent::prepareUpdateData($id, $data);
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

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        return parent::deleteRestore($id);
    }

    private function fail(string $message, int $code): array
    {
        return ['success' => false, 'message' => $message, 'code' => $code];
    }
}
