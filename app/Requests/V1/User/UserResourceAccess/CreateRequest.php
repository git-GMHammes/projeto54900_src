<?php

namespace App\Requests\V1\User\UserResourceAccess;

/**
 * Regras de validacao para POST /create (tabela user_resource_access).
 *
 *   user_manager_id BIGINT NOT NULL
 *   resource_type   ENUM('form','list') NOT NULL
 *   resource_id     BIGINT NOT NULL (id de form_manager ou list_manager)
 *   allowed         TINYINT(1) DEFAULT 1 (1 = libera, 0 = nega)
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'user_manager_id' => 'required|is_natural_no_zero',
            'resource_type'   => 'required|in_list[form,list]',
            'resource_id'     => 'required|is_natural_no_zero',
            'allowed'         => 'permit_empty|in_list[0,1]',
        ];
    }

    public function messages(): array
    {
        return [
            'user_manager_id' => [
                'required'            => 'O campo user_manager_id e obrigatorio',
                'is_natural_no_zero'  => 'O campo user_manager_id deve ser um id valido',
            ],
            'resource_type' => [
                'required' => 'O campo resource_type e obrigatorio',
                'in_list'  => 'O campo resource_type deve ser form ou list',
            ],
            'resource_id' => [
                'required'           => 'O campo resource_id e obrigatorio',
                'is_natural_no_zero' => 'O campo resource_id deve ser um id valido',
            ],
            'allowed' => [
                'in_list' => 'O campo allowed deve ser 0 ou 1',
            ],
        ];
    }
}
