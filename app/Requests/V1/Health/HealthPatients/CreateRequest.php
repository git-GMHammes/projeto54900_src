<?php

namespace App\Requests\V1\Health\HealthPatients;

/**
 * Regras de entrada do POST /create da tabela health_patients.
 *
 * usuario que e paciente da empresa, com dados clinicos basicos. Regras de negocio (vinculos, unicidade, status) ficam no Processor.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            /*
            CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:41:00
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Health\HealthPatients\CreateRequest.php
            LINHA ALTERADA - linha 23 neste arquivo editado:
            Era : 'user_id' => 'required|is_natural_no_zero|is_not_unique[user_manager.id]',
            Ficou : 'user_id' => 'permit_empty|is_natural_no_zero|is_not_unique[user_manager.id]',
            Motivo: o vinculo user_id passa a ser opcional (pode ser NULL); quando informado continua validado.
            */
            'user_id' => 'permit_empty|is_natural_no_zero|is_not_unique[user_manager.id]',
            'birth_date' => 'permit_empty|string|valid_date[Y-m-d]',
            'sex' => 'permit_empty|in_list[female,male,other,undisclosed]',
            'blood_type' => 'permit_empty|in_list[A+,A-,B+,B-,AB+,AB-,O+,O-,unknown]',
            'insurance_name' => 'permit_empty|string|max_length[100]',
            'insurance_number' => 'permit_empty|string|max_length[50]',
            'emergency_contact_name' => 'permit_empty|string|max_length[150]',
            'emergency_contact_phone' => 'permit_empty|string|max_length[20]',
            'notes' => 'permit_empty|string',
            'status' => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id' => [
                'required' => 'Informe user_id',
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
        ];
    }
}
