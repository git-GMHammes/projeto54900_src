<?php

namespace App\Requests\V1\Messages\MessageWarnings;

/**
 * Regras de entrada do PUT /api/v1/message-warnings/update/{id} (so admin).
 *
 * So `flagged_word` e editavel; mensagem, autor e grupo sao imutaveis depois de criados.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'flagged_word' => 'required|string|max_length[150]',
        ];
    }

    public function messages(): array
    {
        return [
            'flagged_word' => ['required' => 'A palavra marcada e obrigatoria', 'max_length' => 'A palavra deve ter no maximo 150 caracteres'],
        ];
    }
}
