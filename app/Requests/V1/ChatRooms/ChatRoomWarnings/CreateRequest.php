<?php

namespace App\Requests\V1\ChatRooms\ChatRoomWarnings;

/**
 * Regras de entrada do POST /api/v1/chat-room-warnings/create.
 *
 * Rota adminonly (modulo inteiro): nao ha "autor" de uma advertencia, e
 * registro de moderacao sobre outro usuario. O Processor confere que a
 * mensagem pertence a sala informada.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'chat_rooms_manager_id' => 'required|is_natural_no_zero',
            'user_manager_id'       => 'required|is_natural_no_zero',
            'chat_message_id'       => 'required|is_natural_no_zero',
            'flagged_word'          => 'permit_empty|string|max_length[150]',
        ];
    }

    public function messages(): array
    {
        return [
            'chat_rooms_manager_id' => [
                'required'            => 'Informe a sala da advertencia',
                'is_natural_no_zero' => 'Sala invalida',
            ],
            'user_manager_id' => [
                'required'            => 'Informe o usuario advertido',
                'is_natural_no_zero' => 'Usuario invalido',
            ],
            'chat_message_id' => [
                'required'            => 'Informe a mensagem que gerou a advertencia',
                'is_natural_no_zero' => 'Mensagem invalida',
            ],
        ];
    }
}
