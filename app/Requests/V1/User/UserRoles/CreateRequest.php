<?php

namespace App\Requests\V1\User\UserRoles;

/**
 * Regras de validacao para POST /create (tabela user_roles).
 *
 * DDL de referencia:
 *   name        VARCHAR(100) NOT NULL
 *   slug        VARCHAR(100) NOT NULL UNIQUE
 *   description VARCHAR(255) NULL
 *   permissions JSON         NULL
 *   status      TINYINT(1)   NOT NULL DEFAULT 1
 *
 * Unicidade de slug e verificada no hook validateOnCreate (Processor).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'name'        => 'required|string|max_length[100]',
            'slug'        => 'required|string|max_length[100]|regex_match[/^[a-z0-9]+(?:-[a-z0-9]+)*$/]',
            'description' => 'permit_empty|string|max_length[255]',
            'permissions' => 'permit_empty',
            'status'      => 'permit_empty|in_list[0,1]',
        ];
    }

    public function messages(): array
    {
        return [
            'name' => [
                'required'   => 'O campo name e obrigatorio',
                'max_length' => 'O campo name nao pode exceder 100 caracteres',
            ],
            'slug' => [
                'required'    => 'O campo slug e obrigatorio',
                'max_length'  => 'O campo slug nao pode exceder 100 caracteres',
                'regex_match' => 'O campo slug deve ser kebab-case (a-z, 0-9 e hifen)',
            ],
            'description' => [
                'max_length' => 'O campo description nao pode exceder 255 caracteres',
            ],
            'status' => [
                'in_list' => 'O campo status deve ser 0 ou 1',
            ],
        ];
    }
}
