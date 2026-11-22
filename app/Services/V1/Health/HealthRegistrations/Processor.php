<?php

namespace App\Services\V1\Health\HealthRegistrations;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Health\HealthRegistrations\SqlTableModel;
use App\Models\V1\Health\HealthRegistrations\SqlViewModel;
/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:58:30
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthRegistrations\Processor.php
LINHA ADICIONADA - linha 16 neste arquivo editado: use App\Models\V1\Health\HealthRecords\SqlTableModel as RecordModel;
Antes de : use App\Models\V1\Health\HealthRegistrations\SqlViewModel;
Depois de : use App\Models\V1\User\UserManager\SqlTableModel as UserModel;
Motivo: importar o model de prontuario usado no bloqueio da exclusao definitiva.
*/
use App\Models\V1\Health\HealthRecords\SqlTableModel as RecordModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserModel;
use App\Services\V1\BaseTableService;

/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:58:30
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthRegistrations\Processor.php
BLOCO ALTERADO - 3 linhas (40 a 42 neste arquivo editado):
Era :
 *  - Nenhum trigger no banco: tudo aqui.
Ficou :
 *  - Exclusao definitiva (deleteHard e clearDeleted, so admin): 409 se o registro tiver prontuario (sem FK no banco, o bloqueio
 *    e feito aqui). No clearDeleted em lote, os bloqueados sao pulados e contados.
 *  - Nenhum trigger no banco: tudo aqui.
Motivo: documentar o bloqueio da exclusao definitiva, agora no codigo.
*/
/**
 * Service de negocio do modulo Health/HealthRegistrations — registro em conselho profissional (CRM e outros) de usuario ou empresa.
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - subject_type user exige user_id de usuario da empresa da sessao (422); company exige user_id vazio (422).
 *  - Conselho + UF + numero sao unicos na empresa, inclusive excluidos (409). A UF e gravada em maiusculas.
 *  - subject_type e user_id sao imutaveis no update.
 *  - Exclusao definitiva (deleteHard e clearDeleted, so admin): 409 se o registro tiver prontuario (sem FK no banco, o bloqueio
 *    e feito aqui). No clearDeleted em lote, os bloqueados sao pulados e contados.
 *  - Nenhum trigger no banco: tudo aqui.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private UserModel $userModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
        $this->userModel  = new UserModel();
    }

    protected function validateOnCreate(array $data): ?array
    {
        $type   = (string) ($data['subject_type'] ?? 'user');
        $userId = (int) ($data['user_id'] ?? 0);

        if ($type === 'user') {
            if ($userId <= 0) {
                return $this->fail('Informe user_id para registro de usuario', 422);
            }

            if (!$this->userModel->find($userId)) {
                return $this->fail('Usuario nao encontrado na empresa', 422);
            }
        } elseif ($userId > 0) {
            return $this->fail('Registro de empresa nao tem user_id', 422);
        }

        return $this->registrationConflict(
            (string) ($data['council'] ?? 'CRM'),
            strtoupper((string) ($data['state'] ?? '')),
            (string) ($data['registration_number'] ?? ''),
            null
        );
    }

    protected function prepareData(array $data): array
    {
        $data['subject_type'] = $data['subject_type'] ?? 'user';
        $data['council']      = $data['council'] ?? 'CRM';
        $data['state']        = strtoupper((string) ($data['state'] ?? ''));

        if ($data['subject_type'] === 'company') {
            $data['user_id'] = null;
        }

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['subject_type'], $data['user_id']);

        if (isset($data['state'])) {
            $data['state'] = strtoupper((string) $data['state']);
        }

        return parent::prepareUpdateData($id, $data);
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $existing = $this->tableModel->find($id);

        if (!$existing) {
            return null;
        }

        return $this->registrationConflict(
            (string) ($data['council'] ?? $existing['council']),
            strtoupper((string) ($data['state'] ?? $existing['state'])),
            (string) ($data['registration_number'] ?? $existing['registration_number']),
            $id
        );
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

    /*
    CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:58:30
    Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthRegistrations\Processor.php
    BLOCO ADICIONADO - 44 linhas (172 a 215 neste arquivo editado): deleteHard, clearDeleted e recordedRegistrations (bloqueio por prontuario)
    Antes de :     }  (fim do metodo fail)
    Depois de : (linha em branco, seguida de outro metodo)
    Motivo: sem FK no banco, a regra de exclusao definitiva (cascata ou bloqueio) passa a ser do Processor.
    */
    public function deleteHard(int $id): array
    {
        if (!$this->tableModel->findWithDeleted($id)) {
            return $this->fail('Registro nao encontrado', 404);
        }

        if ($this->recordedRegistrations([$id]) !== []) {
            return $this->fail('Registro profissional com prontuario nao pode ser excluido definitivamente', 409);
        }

        return parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        $builder = $this->tableModel->onlyDeleted();

        if ($id !== null) {
            $builder->where('id', $id);
        }

        $ids     = array_map('intval', array_column($builder->findAll(), 'id'));
        $blocked = $this->recordedRegistrations($ids);
        $affected = 0;

        foreach (array_diff($ids, $blocked) as $one) {
            $affected += $this->tableModel->clearDeleted($one);
        }

        return ['affected' => $affected, 'blocked' => count($blocked)];
    }

    // Sem FK no banco: ids de registro profissional que ainda tem prontuario (bloqueiam a exclusao definitiva).
    private function recordedRegistrations(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        $rows = (new RecordModel())->builder()->select('professional_id')->distinct()->whereIn('professional_id', $ids)->get()->getResultArray();

        return array_map('intval', array_column($rows, 'professional_id'));
    }

    private function registrationConflict(string $council, string $state, string $number, ?int $excludeId): ?array
    {
        $builder = $this->tableModel->withDeleted()
            ->where('council', $council)
            ->where('state', $state)
            ->where('registration_number', $number);

        if ($excludeId !== null) {
            $builder->where('id !=', $excludeId);
        }

        return $builder->countAllResults() > 0
            ? $this->fail('Ja existe este registro profissional na empresa', 409)
            : null;
    }
}
