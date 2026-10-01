<?php

namespace App\Requests\V1\ChatRooms\ChatRoomFavorites;

/**
 * Regras de entrada do PUT /api/v1/chat-room-favorites/update/{id}.
 *
 * Sem campos editaveis: a tabela so tem os vinculos com sala e usuario, e
 * ambos sao imutaveis apos criados. Endpoint mantido so para completar o
 * contrato de 18 rotas (mesmo padrao dos demais recursos do projeto).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [];
    }

    public function messages(): array
    {
        return [];
    }
}
