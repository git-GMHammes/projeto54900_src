<?php

namespace App\Requests\V1\ChatRooms\ChatMessages;

/**
 * Regras de entrada do POST /api/v1/chat-messages/create.
 *
 * `user_manager_id` e preenchido pelo Processor com o usuario da sessao
 * (qualquer valor enviado no corpo e ignorado). `status` tambem e ignorado:
 * toda mensagem nasce `sent` (o filtro de palavrao que gravaria `blocked` e
 * integracao futura, ver README_modulo_chatrooms.md). O Processor ainda
 * recusa o create se a sala nao existir, estiver fechada ou o usuario nao
 * estiver ativo.
 *
 * `mentions` e opcional: lista de ids de vinculo (chat_room_members.id) dos
 * membros marcados. O Processor confere se cada vinculo e da sala e esta
 * ativo, e grava o usuario em chat_message_mentions.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'chat_rooms_manager_id' => 'required|is_natural_no_zero',
            'user_manager_id'       => 'permit_empty|is_natural_no_zero',
            'content'               => 'required|string',
            'status'                => 'permit_empty|in_list[sent,blocked,removed]',
            'mentions'              => 'permit_empty',
        ];
    }

    public function messages(): array
    {
        return [
            'chat_rooms_manager_id' => [
                'required'            => 'Informe a sala da mensagem',
                'is_natural_no_zero' => 'Sala invalida',
            ],
            'content' => [
                'required' => 'A mensagem nao pode ficar vazia',
            ],
            'status' => [
                'in_list' => 'Status invalido: use sent, blocked ou removed',
            ],
        ];
    }
}
