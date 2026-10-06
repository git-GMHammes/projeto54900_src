<?php

namespace App\Requests\V1\Messages\MessageGroupMembers;

/**
 * Regras de entrada do POST /api/v1/message-group-members/create.
 *
 * Adiciona (ou reativa) um usuario como membro do grupo. Papel e status nao
 * sao aceitos: o vinculo nasce `member` e `active`. Para varios usuarios de
 * uma vez, usar PUT sync/{groupId}.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'message_groups_manager_id' => 'required|is_natural_no_zero',
            'user_manager_id'           => 'required|is_natural_no_zero',
        ];
    }

    public function messages(): array
    {
        return [
            'message_groups_manager_id' => ['required' => 'O grupo e obrigatorio'],
            'user_manager_id'           => ['required' => 'O usuario e obrigatorio'],
        ];
    }
}
