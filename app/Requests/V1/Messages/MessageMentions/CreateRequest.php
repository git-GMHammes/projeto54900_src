<?php

namespace App\Requests\V1\Messages\MessageMentions;

/**
 * Regras de entrada do POST /api/v1/message-mentions/create.
 *
 * Marca um usuario (@) numa mensagem de GRUPO: `messages_manager_id` (a mensagem) e `user_manager_id` (o
 * marcado, membro ativo do grupo da mensagem e diferente do remetente). So o remetente da mensagem ou o admin
 * marca. Idempotente. No modo chat as marcacoes nascem junto da mensagem (`mentions[]` no create da mensagem).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'messages_manager_id' => 'required|is_natural_no_zero',
            'user_manager_id'     => 'required|is_natural_no_zero',
        ];
    }

    public function messages(): array
    {
        return [
            'messages_manager_id' => ['required' => 'A mensagem e obrigatoria'],
            'user_manager_id'     => ['required' => 'O usuario marcado e obrigatorio'],
        ];
    }
}
