<?php

namespace App\Requests\V1\Health\HealthAllergies;

/**
 * Regras de entrada do POST /create da tabela health_allergies.
 *
 * alergia do paciente (substancia, reacao, gravidade). Regras de negocio (vinculos, unicidade, status) ficam no Processor.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            /*
            CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:41:00
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Health\HealthAllergies\CreateRequest.php
            LINHA ALTERADA - linha 23 neste arquivo editado:
            Era : 'patient_id' => 'required|is_natural_no_zero|is_not_unique[health_patients.id]',
            Ficou : 'patient_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_patients.id]',
            Motivo: o vinculo patient_id passa a ser opcional (pode ser NULL); quando informado continua validado.
            */
            'patient_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_patients.id]',
            'substance' => 'required|string|max_length[150]',
            'reaction' => 'permit_empty|string|max_length[255]',
            'severity' => 'permit_empty|in_list[mild,moderate,severe]',
            'notes' => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id' => [
                'required' => 'Informe patient_id',
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'substance' => [
                'required' => 'Informe substance',
            ],
        ];
    }
}
