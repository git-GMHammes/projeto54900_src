<?php

namespace App\Requests\V1\ChatRooms\ChatRoomsManager;

/**
 * Regras de entrada do POST /api/v1/chat-rooms-manager/create.
 *
 * `owner_user_manager_id` e preenchido pelo Processor com o usuario da sessao
 * (qualquer valor enviado no corpo e ignorado). `moderation_accepted` exige
 * exatamente 1: o dono declara que assume a responsabilidade pela moderacao
 * da sala antes dela existir — sem isso o create nem chega ao Processor.
 * `status`/`closed_at`/`closed_reason` nao entram: a sala sempre nasce
 * `open` (DEFAULT da coluna).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'owner_user_manager_id' => 'permit_empty|is_natural_no_zero',
            'name'                  => 'required|string|max_length[150]',
            'description'           => 'permit_empty|string',
            'moderation_accepted'   => 'required|in_list[1]',
        ];
    }

    public function messages(): array
    {
        return [
            'name' => [
                'required'   => 'O nome da sala e obrigatorio',
                'max_length' => 'O nome deve ter no maximo 150 caracteres',
            ],
            'moderation_accepted' => [
                'required' => 'E preciso aceitar a responsabilidade pela moderacao da sala',
                'in_list'  => 'E preciso aceitar a responsabilidade pela moderacao da sala',
            ],
        ];
    }
}
