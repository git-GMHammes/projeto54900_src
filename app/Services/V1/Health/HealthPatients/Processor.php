<?php

namespace App\Services\V1\Health\HealthPatients;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Health\HealthPatients\SqlTableModel;
use App\Models\V1\Health\HealthPatients\SqlViewModel;
/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:58:30
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthPatients\Processor.php
BLOCO ADICIONADO - 2 linhas (16 a 17 neste arquivo editado): imports dos models usados na exclusao definitiva
Antes de : use App\Models\V1\Health\HealthPatients\SqlViewModel;
Depois de : use App\Models\V1\User\UserManager\SqlTableModel as UserModel;
Motivo: importar os models de prontuario e alergia usados na exclusao definitiva.
*/
use App\Models\V1\Health\HealthAllergies\SqlTableModel as AllergyModel;
use App\Models\V1\Health\HealthRecords\SqlTableModel as RecordModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserModel;
use App\Services\V1\BaseTableService;

/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:58:30
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthPatients\Processor.php
BLOCO ALTERADO - 3 linhas (41 a 43 neste arquivo editado):
Era :
 *  - Nenhum trigger no banco: tudo aqui.
Ficou :
 *  - Exclusao definitiva (deleteHard e clearDeleted, so admin): 409 se o paciente tiver prontuario; apaga junto as alergias
 *    (sem FK no banco, o bloqueio e a cascata sao feitos aqui). No clearDeleted em lote, os bloqueados sao pulados e contados.
 *  - Nenhum trigger no banco: tudo aqui.
Motivo: documentar o bloqueio e a cascata da exclusao definitiva, agora no codigo.
*/
/**
 * Service de negocio do modulo Health/HealthPatients — usuario que e paciente da empresa, com dados clinicos basicos.
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - O usuario e opcional (user_id pode ser NULL); quando informado, precisa existir e pertencer a empresa da sessao (422).
 *  - Um usuario e paciente uma unica vez por empresa, inclusive excluido (409).
 *  - user_id pode ser informado ou trocado no update (validado da mesma forma).
 *  - Exclusao definitiva (deleteHard e clearDeleted, so admin): 409 se o paciente tiver prontuario; apaga junto as alergias
 *    (sem FK no banco, o bloqueio e a cascata sao feitos aqui). No clearDeleted em lote, os bloqueados sao pulados e contados.
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
        return $this->checkUser((int) ($data['user_id'] ?? 0), null);
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        return $this->checkUser((int) ($data['user_id'] ?? 0), $id);
    }

    // O usuario e opcional: so valida existencia e unicidade quando vier informado.
    private function checkUser(int $userId, ?int $excludeId): ?array
    {
        if ($userId <= 0) {
            return null;
        }

        if (!$this->userModel->find($userId)) {
            return $this->fail('Usuario nao encontrado na empresa', 422);
        }

        $builder = $this->tableModel->withDeleted()->where('user_id', $userId);

        if ($excludeId !== null) {
            $builder->where('id !=', $excludeId);
        }

        return $builder->countAllResults() > 0
            ? $this->fail('Este usuario ja e paciente da empresa', 409)
            : null;
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
    Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthPatients\Processor.php
    BLOCO ADICIONADO - 58 linhas (139 a 196 neste arquivo editado): deleteHard, clearDeleted, recordedPatients e purgeAllergies (bloqueio por prontuario e cascata nas alergias)
    Antes de :     }  (fim do metodo fail)
    Depois de : }  (fim da classe)
    Motivo: sem FK no banco, a regra de exclusao definitiva (cascata ou bloqueio) passa a ser do Processor.
    */

    public function deleteHard(int $id): array
    {
        if (!$this->tableModel->findWithDeleted($id)) {
            return $this->fail('Registro nao encontrado', 404);
        }

        if ($this->recordedPatients([$id]) !== []) {
            return $this->fail('Paciente com prontuario nao pode ser excluido definitivamente', 409);
        }

        $this->purgeAllergies([$id]);

        return parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        $builder = $this->tableModel->onlyDeleted();

        if ($id !== null) {
            $builder->where('id', $id);
        }

        $ids     = array_map('intval', array_column($builder->findAll(), 'id'));
        $blocked = $this->recordedPatients($ids);
        $free    = array_values(array_diff($ids, $blocked));

        $this->purgeAllergies($free);

        $affected = 0;

        foreach ($free as $one) {
            $affected += $this->tableModel->clearDeleted($one);
        }

        return ['affected' => $affected, 'blocked' => count($blocked)];
    }

    // Sem FK no banco: ids de paciente que ainda tem prontuario (bloqueiam a exclusao definitiva).
    private function recordedPatients(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        $rows = (new RecordModel())->builder()->select('patient_id')->distinct()->whereIn('patient_id', $ids)->get()->getResultArray();

        return array_map('intval', array_column($rows, 'patient_id'));
    }

    // Sem FK no banco: a exclusao definitiva do paciente leva as alergias dele.
    private function purgeAllergies(array $ids): void
    {
        if ($ids !== []) {
            (new AllergyModel())->builder()->whereIn('patient_id', $ids)->delete();
        }
    }
}
