<?php

namespace App\Requests\V1\Messages\MessageGroupMembers;

/**
 * Regras de entrada do PUT /api/v1/message-group-members/update/{id}.
 *
 * So o status do vinculo muda (active/removed); grupo, usuario e papel sao
 * imutaveis. O vinculo do dono nao pode ser removido.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'status' => 'required|in_list[active,removed]',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => [
                'required' => 'O status e obrigatorio',
                'in_list'  => 'O status deve ser active ou removed',
            ],
        ];
    }
}
