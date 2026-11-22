<?php

namespace App\Requests\V1\Health\HealthRecords;

/**
 * Regras de entrada do POST /create da tabela health_records.
 *
 * prontuario do atendimento (queixa, anamnese, diagnostico, CID-10, conduta). Regras de negocio (vinculos, unicidade, status) ficam no Processor.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            /*
            CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:41:00
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Health\HealthRecords\CreateRequest.php
            LINHA ALTERADA - linha 23 neste arquivo editado:
            Era : 'patient_id' => 'required|is_natural_no_zero|is_not_unique[health_patients.id]',
            Ficou : 'patient_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_patients.id]',
            Motivo: o vinculo patient_id passa a ser opcional (pode ser NULL); quando informado continua validado.
            */
            'patient_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_patients.id]',
            /*
            CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:41:00
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Health\HealthRecords\CreateRequest.php
            LINHA ALTERADA - linha 32 neste arquivo editado:
            Era : 'professional_id' => 'required|is_natural_no_zero|is_not_unique[health_registrations.id]',
            Ficou : 'professional_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_registrations.id]',
            Motivo: o vinculo professional_id passa a ser opcional (pode ser NULL); quando informado continua validado.
            */
            'professional_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_registrations.id]',
            'service_order_id' => 'permit_empty|is_natural_no_zero|is_not_unique[service_order.id]',
            'complaint' => 'permit_empty|string',
            'anamnesis' => 'permit_empty|string',
            'diagnosis' => 'permit_empty|string',
            'cid10' => 'permit_empty|string|max_length[10]',
            'conduct' => 'permit_empty|string',
            'notes' => 'permit_empty|string',
            'status' => 'permit_empty|in_list[draft,signed,cancelled]',
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id' => [
                'required' => 'Informe patient_id',
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'professional_id' => [
                'required' => 'Informe professional_id',
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'service_order_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
        ];
    }
}
