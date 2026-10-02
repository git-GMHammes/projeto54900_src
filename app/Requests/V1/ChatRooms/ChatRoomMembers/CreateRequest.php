<?php

namespace App\Requests\V1\ChatRooms\ChatRoomMembers;

/**
 * Regras de entrada do POST /api/v1/chat-room-members/create.
 *
 * Adiciona um usuario a uma sala (so o dono da sala ou admin — ver
 * Processor). `role` default `member`; `status` default `active` (DEFAULT
 * das colunas). `blocked_at` nao e aceito do cliente: o Processor
 * preenche a partir de status=blocked.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'chat_rooms_manager_id' => 'required|is_natural_no_zero',
            'user_manager_id'       => 'required|is_natural_no_zero',
            'role'                  => 'permit_empty|in_list[owner,member]',
            'status'                => 'permit_empty|in_list[active,blocked,left]',
            'blocked_reason'        => 'permit_empty|in_list[profanity_3x,attachment_report,manual]',
        ];
    }

    public function messages(): array
    {
        return [
            'chat_rooms_manager_id' => [
                'required'           => 'Informe a sala',
                'is_natural_no_zero' => 'Sala invalida',
            ],
            'user_manager_id' => [
                'required'           => 'Informe o usuario',
                'is_natural_no_zero' => 'Usuario invalido',
            ],
            'role' => [
                'in_list' => 'Papel invalido: use owner ou member',
            ],
            'status' => [
                'in_list' => 'Status invalido: use active, blocked ou left',
            ],
            'blocked_reason' => [
                'in_list' => 'Motivo invalido: use profanity_3x, attachment_report ou manual',
            ],
        ];
    }
}
