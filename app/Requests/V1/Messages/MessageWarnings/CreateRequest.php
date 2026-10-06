<?php

namespace App\Requests\V1\Messages\MessageWarnings;

/**
 * Regras de entrada do POST /api/v1/message-warnings/create (so admin).
 *
 * A advertencia nasce do sistema (filtro de palavrao); este create e o registro manual administrativo.
 * O grupo vem da propria mensagem (nao e enviado).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'messages_manager_id' => 'required|is_natural_no_zero',
            'user_manager_id'     => 'required|is_natural_no_zero',
            'flagged_word'        => 'required|string|max_length[150]',
        ];
    }

    public function messages(): array
    {
        return [
            'messages_manager_id' => ['required' => 'A mensagem e obrigatoria'],
            'user_manager_id'     => ['required' => 'O autor e obrigatorio'],
            'flagged_word'        => ['required' => 'A palavra marcada e obrigatoria', 'max_length' => 'A palavra deve ter no maximo 150 caracteres'],
        ];
    }
}
