<?php

namespace App\Requests\V1\ChatRooms\ChatMessages;

/**
 * Regras de entrada do PUT /api/v1/chat-messages/update/{id}.
 *
 * Dois usos:
 *  - `status=removed`: autor, moderador da sala ou admin remove a mensagem.
 *  - `content`: só admin altera o conteúdo; o histórico grava o texto anterior
 *    em chat_message_edits (ver Processor). Usuário comum que envia `content`
 *    recebe 403.
 *
 * Pelo menos um dos dois precisa vir — essa conferência fica no Processor.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'status'  => 'permit_empty|in_list[removed]',
            'content' => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => [
                'in_list' => 'Este campo so aceita status=removed',
            ],
        ];
    }
}
