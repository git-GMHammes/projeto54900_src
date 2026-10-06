<?php

namespace App\Requests\V1\Messages\MessageGroupReads;

/**
 * Regras de entrada do PUT /api/v1/message-group-reads/update/{id}.
 *
 * So `read_at` muda (correcao administrativa); mensagem e leitor sao imutaveis. So admin.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'read_at' => 'required|valid_date[Y-m-d H:i:s]',
        ];
    }

    public function messages(): array
    {
        return [
            'read_at' => [
                'required'   => 'A data da leitura e obrigatoria',
                'valid_date' => 'A data da leitura e invalida',
            ],
        ];
    }
}
