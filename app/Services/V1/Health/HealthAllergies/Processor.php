<?php

namespace App\Services\V1\Health\HealthAllergies;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Health\HealthAllergies\SqlTableModel;
use App\Models\V1\Health\HealthAllergies\SqlViewModel;
use App\Models\V1\Health\HealthPatients\SqlTableModel as PatientModel;
use App\Services\V1\BaseTableService;

/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:41:21
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthAllergies\Processor.php
BLOCO ALTERADO - 2 linhas (28 a 29 neste arquivo editado):
Era :
 *  - O paciente precisa existir na empresa da sessao (422).
 *  - patient_id e imutavel no update.
Ficou :
 *  - O paciente e opcional (patient_id pode ser NULL); quando informado, precisa existir na empresa da sessao (422).
 *  - patient_id pode ser informado ou trocado no update (validado da mesma forma).
Motivo: documentar a independencia: o vinculo com o paciente e opcional.
*/
/**
 * Service de negocio do modulo Health/HealthAllergies — alergia do paciente (substancia, reacao, gravidade).
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - O paciente e opcional (patient_id pode ser NULL); quando informado, precisa existir na empresa da sessao (422).
 *  - patient_id pode ser informado ou trocado no update (validado da mesma forma).
 *  - Nenhum trigger no banco: tudo aqui.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private PatientModel $patientModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
        $this->patientModel = new PatientModel();
    }

    protected function validateOnCreate(array $data): ?array
    {
        /*
        CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:41:21
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthAllergies\Processor.php
        BLOCO ALTERADO - 17 linhas (86 a 102 neste arquivo editado):
        Era :
        if (!$this->patientModel->find((int) ($data['patient_id'] ?? 0))) {
            return $this->fail('Paciente nao encontrado', 422);
        }

        return null;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['patient_id']);

        return parent::prepareUpdateData($id, $data);
    }
        Ficou :
        return $this->checkPatient((int) ($data['patient_id'] ?? 0));
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        return $this->checkPatient((int) ($data['patient_id'] ?? 0));
    }

    // O paciente e opcional: so valida quando vier informado.
    private function checkPatient(int $patientId): ?array
    {
        if ($patientId > 0 && !$this->patientModel->find($patientId)) {
            return $this->fail('Paciente nao encontrado', 422);
        }

        return null;
    }
        Motivo: validar o paciente somente quando informado e permitir vincular ou trocar o paciente na edicao.
        */
        return $this->checkPatient((int) ($data['patient_id'] ?? 0));
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        return $this->checkPatient((int) ($data['patient_id'] ?? 0));
    }

    // O paciente e opcional: so valida quando vier informado.
    private function checkPatient(int $patientId): ?array
    {
        if ($patientId > 0 && !$this->patientModel->find($patientId)) {
            return $this->fail('Paciente nao encontrado', 422);
        }

        return null;
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
