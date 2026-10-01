<?php

namespace App\Requests\V1\ChatRooms\ChatRoomWarnings;

/**
 * Regras de entrada do PUT /api/v1/chat-room-warnings/update/{id}.
 *
 * So `flagged_word` e editavel — os vinculos com sala, usuario e mensagem
 * sao imutaveis apos criados (o Processor remove qualquer tentativa de
 * alterar esses campos).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'flagged_word' => 'permit_empty|string|max_length[150]',
        ];
    }

    public function messages(): array
    {
        return [];
    }
}
