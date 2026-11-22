<?php

namespace App\Requests\V1\Health\HealthPrescriptions;

/**
 * Regras de entrada do POST /create da tabela health_prescriptions.
 *
 * receita e medicamento de um prontuario. Regras de negocio (vinculos, unicidade, status) ficam no Processor.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            /*
            CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:41:00
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Health\HealthPrescriptions\CreateRequest.php
            LINHA ALTERADA - linha 23 neste arquivo editado:
            Era : 'record_id' => 'required|is_natural_no_zero|is_not_unique[health_records.id]',
            Ficou : 'record_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_records.id]',
            Motivo: o vinculo record_id passa a ser opcional (pode ser NULL); quando informado continua validado.
            */
            'record_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_records.id]',
            'medication' => 'required|string|max_length[200]',
            'dosage' => 'permit_empty|string|max_length[100]',
            'frequency' => 'permit_empty|string|max_length[100]',
            'duration' => 'permit_empty|string|max_length[100]',
            'instructions' => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'record_id' => [
                'required' => 'Informe record_id',
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'medication' => [
                'required' => 'Informe medication',
            ],
        ];
    }
}
