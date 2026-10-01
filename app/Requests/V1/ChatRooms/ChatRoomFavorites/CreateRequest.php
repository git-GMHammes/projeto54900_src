<?php

namespace App\Requests\V1\ChatRooms\ChatRoomFavorites;

/**
 * Regras de entrada do POST /api/v1/chat-room-favorites/create.
 *
 * Nao existe tela para esta tabela: favoritar e acao de um clique. O
 * Processor usa INSERT na primeira vez e devolve o registro existente se o
 * usuario ja favoritou (a UNIQUE chat_rooms_manager_id + user_manager_id e a
 * rede de seguranca). `user_manager_id` vem sempre da sessao.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'chat_rooms_manager_id' => 'required|is_natural_no_zero',
            'user_manager_id'       => 'permit_empty|is_natural_no_zero',
        ];
    }

    public function messages(): array
    {
        return [
            'chat_rooms_manager_id' => [
                'required'            => 'Informe a sala a favoritar',
                'is_natural_no_zero' => 'Sala invalida',
            ],
        ];
    }
}
