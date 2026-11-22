<?php

namespace App\Requests\V1\Health\HealthExams;

/**
 * Regras de entrada do POST /create da tabela health_exams.
 *
 * exame solicitado em um prontuario e seu resultado. Regras de negocio (vinculos, unicidade, status) ficam no Processor.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            /*
            CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:41:00
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Health\HealthExams\CreateRequest.php
            LINHA ALTERADA - linha 23 neste arquivo editado:
            Era : 'record_id' => 'required|is_natural_no_zero|is_not_unique[health_records.id]',
            Ficou : 'record_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_records.id]',
            Motivo: o vinculo record_id passa a ser opcional (pode ser NULL); quando informado continua validado.
            */
            'record_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_records.id]',
            'name' => 'required|string|max_length[200]',
            'requested_at' => 'permit_empty|string|valid_date[Y-m-d H:i:s]',
            'result_at' => 'permit_empty|string|valid_date[Y-m-d H:i:s]',
            'result_text' => 'permit_empty|string',
            'status' => 'permit_empty|in_list[requested,done,cancelled]',
        ];
    }

    public function messages(): array
    {
        return [
            'record_id' => [
                'required' => 'Informe record_id',
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'name' => [
                'required' => 'Informe name',
            ],
        ];
    }
}
