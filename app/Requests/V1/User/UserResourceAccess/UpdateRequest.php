<?php

namespace App\Requests\V1\User\UserResourceAccess;

/**
 * Regras de validacao para PUT /update/{id} (tabela user_resource_access).
 * Atualizacao parcial; usuario, tipo e recurso nao mudam (Processor ignora) —
 * so allowed e alterado.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'allowed' => 'permit_empty|in_list[0,1]',
        ];
    }

    public function messages(): array
    {
        return [
            'allowed' => [
                'in_list' => 'O campo allowed deve ser 0 ou 1',
            ],
        ];
    }
}
