<?php

namespace App\Requests\V1\Messages\MessageGroupReads;

/**
 * Regras de entrada do POST /api/v1/message-group-reads/create.
 *
 * Registra que o usuario LEU uma mensagem de grupo. `user_manager_id` vazio = usuario da sessao
 * (outro usuario so para admin). Idempotente: ler de novo devolve a leitura existente.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'messages_manager_id' => 'required|is_natural_no_zero',
            'user_manager_id'     => 'permit_empty|is_natural_no_zero',
        ];
    }

    public function messages(): array
    {
        return [
            'messages_manager_id' => ['required' => 'A mensagem e obrigatoria'],
        ];
    }
}
