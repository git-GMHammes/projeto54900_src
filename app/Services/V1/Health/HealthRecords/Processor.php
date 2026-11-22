<?php

namespace App\Services\V1\Health\HealthRecords;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Health\HealthPatients\SqlTableModel as PatientModel;
/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:58:30
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthRecords\Processor.php
BLOCO ADICIONADO - 3 linhas (15 a 17 neste arquivo editado): imports dos models usados na exclusao definitiva
Antes de : use App\Models\V1\Health\HealthPatients\SqlTableModel as PatientModel;
Depois de : use App\Models\V1\Health\HealthRecords\SqlTableModel;
Motivo: importar os models dos itens do prontuario para a cascata.
*/
use App\Models\V1\Health\HealthExams\SqlTableModel as ExamModel;
use App\Models\V1\Health\HealthPrescriptions\SqlTableModel as PrescriptionModel;
use App\Models\V1\Health\HealthVitals\SqlTableModel as VitalModel;
use App\Models\V1\Health\HealthRecords\SqlTableModel;
use App\Models\V1\Health\HealthRecords\SqlViewModel;
use App\Models\V1\Health\HealthRegistrations\SqlTableModel as RegistrationModel;
use App\Models\V1\Service\ServiceOrder\SqlTableModel as ServiceOrderModel;
use App\Services\V1\BaseTableService;

/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:58:30
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthRecords\Processor.php
BLOCO ALTERADO - 3 linhas (48 a 50 neste arquivo editado):
Era :
 *  - Nenhum trigger no banco: tudo aqui.
Ficou :
 *  - Exclusao definitiva (deleteHard e clearDeleted, so admin): apaga junto as receitas, exames e sinais vitais do prontuario
 *    (sem FK no banco, a cascata e feita aqui).
 *  - Nenhum trigger no banco: tudo aqui.
Motivo: documentar a cascata da exclusao definitiva, agora feita no codigo.
*/
/**
 * Service de negocio do modulo Health/HealthRecords — prontuario do atendimento (queixa, anamnese, diagnostico, CID-10, conduta).
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - Paciente e registro profissional sao opcionais (IDs podem ser NULL); quando informados, precisam existir na empresa
 *    da sessao (422). O registro profissional informado precisa estar active e dentro de valid_until (422).
 *  - service_order_id, quando informado, precisa ser de OS da empresa (422). Se a OS tiver customer_user_id,
 *    ele deve ser o usuario do paciente; se tiver executor_user_id, deve ser o usuario do profissional (422).
 *  - O prontuario nasce draft; signed_at vem do servidor ao assinar.
 *  - Fluxo: draft -> signed | cancelled; signed -> cancelled. Prontuario signed ou cancelled nao e editado (409).
 *  - Paciente e profissional podem ser informados ou trocados no update (enquanto o prontuario esta em rascunho).
 *  - Exclusao definitiva (deleteHard e clearDeleted, so admin): apaga junto as receitas, exames e sinais vitais do prontuario
 *    (sem FK no banco, a cascata e feita aqui).
 *  - Nenhum trigger no banco: tudo aqui.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private PatientModel $patientModel;
    private RegistrationModel $registrationModel;
    private ServiceOrderModel $serviceOrderModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
        $this->patientModel      = new PatientModel();
        $this->registrationModel = new RegistrationModel();
        $this->serviceOrderModel = new ServiceOrderModel();
    }

    protected function validateOnCreate(array $data): ?array
    {
        return $this->checkLinks(
            (int) ($data['patient_id'] ?? 0),
            (int) ($data['professional_id'] ?? 0),
            (int) ($data['service_order_id'] ?? 0),
            true
        );
    }

    protected function prepareData(array $data): array
    {
        unset($data['signed_at']);

        $data['status'] = 'draft';

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['signed_at']);

        $existing = $this->tableModel->find($id);

        if (!$existing) {
            return $data;
        }

        if ($existing['status'] !== 'draft') {
            return isset($data['status']) ? ['status' => $data['status']] : [];
        }

        if (($data['status'] ?? null) === 'signed') {
            $data['signed_at'] = date('Y-m-d H:i:s');
        }

        return $data;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $existing = $this->tableModel->find($id);

        if (!$existing) {
            return null;
        }

        $current = (string) $existing['status'];
        $next    = (string) ($data['status'] ?? $current);

        if ($current !== 'draft' && !($current === 'signed' && $next === 'cancelled')) {
            return $this->fail('Prontuario assinado ou cancelado nao pode ser editado', 409);
        }

        if (!array_key_exists('patient_id', $data) && !array_key_exists('professional_id', $data) && !array_key_exists('service_order_id', $data)) {
            return null;
        }

        $pick = static fn (string $key) => (int) (array_key_exists($key, $data) ? $data[$key] : ($existing[$key] ?? 0));

        return $this->checkLinks(
            $pick('patient_id'),
            $pick('professional_id'),
            $pick('service_order_id'),
            array_key_exists('professional_id', $data) && (int) $data['professional_id'] !== (int) ($existing['professional_id'] ?? 0)
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
    Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Services\V1\Health\HealthRecords\Processor.php
    BLOCO ADICIONADO - 36 linhas (188 a 223 neste arquivo editado): deleteHard, clearDeleted e purgeItems (cascata nos itens do prontuario)
    Antes de :     }  (fim do metodo fail)
    Depois de :     // Todos os vinculos sao opcionais: so valida o que vier informado.
    Motivo: sem FK no banco, a exclusao definitiva do prontuario apaga os itens no codigo (antes era CASCADE).
    */
    public function deleteHard(int $id): array
    {
        if (!$this->tableModel->findWithDeleted($id)) {
            return $this->fail('Registro nao encontrado', 404);
        }

        $this->purgeItems([$id]);

        return parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        $builder = $this->tableModel->onlyDeleted();

        if ($id !== null) {
            $builder->where('id', $id);
        }

        $this->purgeItems(array_map('intval', array_column($builder->findAll(), 'id')));

        return parent::clearDeleted($id);
    }

    // Sem FK no banco: a exclusao definitiva do prontuario leva as receitas, os exames e os sinais vitais dele.
    private function purgeItems(array $recordIds): void
    {
        if ($recordIds === []) {
            return;
        }

        foreach ([new PrescriptionModel(), new ExamModel(), new VitalModel()] as $model) {
            $model->builder()->whereIn('record_id', $recordIds)->delete();
        }
    }

    // Todos os vinculos sao opcionais: so valida o que vier informado.
    private function checkLinks(int $patientId, int $professionalId, int $serviceOrderId, bool $checkProfessional): ?array
    {
        $patient = null;

        if ($patientId > 0) {
            $patient = $this->patientModel->find($patientId);

            if (!$patient) {
                return $this->fail('Paciente nao encontrado', 422);
            }
        }

        $registration = null;

        if ($professionalId > 0) {
            $registration = $this->registrationModel->find($professionalId);

            if (!$registration) {
                return $this->fail('Registro profissional nao encontrado', 422);
            }

            if ($checkProfessional && $registration['status'] !== 'active') {
                return $this->fail('Registro profissional inativo ou suspenso', 422);
            }

            if ($checkProfessional && !empty($registration['valid_until']) && $registration['valid_until'] < date('Y-m-d')) {
                return $this->fail('Registro profissional vencido', 422);
            }
        }

        return $this->checkServiceOrder($serviceOrderId, $patient, $registration);
    }
    private function checkServiceOrder(int $serviceOrderId, ?array $patient, ?array $registration): ?array
    {
        if ($serviceOrderId <= 0) {
            return null;
        }

        $order = $this->serviceOrderModel->find($serviceOrderId);

        if (!$order) {
            return $this->fail('Ordem de servico nao encontrada', 422);
        }

        if ($patient !== null && !empty($patient['user_id']) && !empty($order['customer_user_id']) && (int) $order['customer_user_id'] !== (int) $patient['user_id']) {
            return $this->fail('A ordem de servico e de outro paciente', 422);
        }

        if (
            $registration !== null && !empty($order['executor_user_id']) && !empty($registration['user_id'])
            && (int) $order['executor_user_id'] !== (int) $registration['user_id']
        ) {
            return $this->fail('A ordem de servico e de outro profissional', 422);
        }

        return null;
    }
}
