<?php

namespace App\Requests\V1\Messages\MessageMentions;

/**
 * Regras de entrada do PUT /api/v1/message-mentions/update/{id}.
 *
 * Troca o usuario marcado (correcao administrativa); a mensagem e imutavel. So admin; o novo marcado
 * segue as mesmas regras do create (membro ativo do grupo, nunca o remetente).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'user_manager_id' => 'required|is_natural_no_zero',
        ];
    }

    public function messages(): array
    {
        return [
            'user_manager_id' => ['required' => 'O usuario marcado e obrigatorio'],
        ];
    }
}
