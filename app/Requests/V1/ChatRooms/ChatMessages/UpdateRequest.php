<?php

namespace App\Requests\V1\ChatRooms\ChatMessages;

/**
 * Regras de entrada do PUT /api/v1/chat-messages/update/{id}.
 *
 * Conteudo e imutavel apos criado — este endpoint so serve para o autor ou
 * o moderador da sala marcar a mensagem como `removed` (ver Processor).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'status' => 'required|in_list[removed]',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => [
                'required' => 'Informe o novo status da mensagem',
                'in_list'  => 'Este endpoint so aceita status=removed',
            ],
        ];
    }
}
