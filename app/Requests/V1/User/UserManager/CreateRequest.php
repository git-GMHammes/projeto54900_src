<?php

namespace App\Requests\V1\User\UserManager;

/**
 * Regras de validação para POST /create (tabela user_manager).
 *
 * DDL de referência:
 *   username      VARCHAR(255)                        NOT NULL UNIQUE
 *   password_hash VARCHAR(255)                        NOT NULL
 *   token         VARCHAR(255)                        NULL
 *   status        ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active'
 *   last_login_at DATETIME                            NULL
 *
 * status não é aceito como entrada — todo novo usuário nasce com o valor
 * DEFAULT da coluna no banco (ver Services\V1\User\UserManager\Processor::prepareData).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'username'      => 'required|string|max_length[255]',
            'password_hash' => 'required|string|max_length[255]',
            'token'         => 'permit_empty|string|max_length[255]',
            'last_login_at' => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'username' => [
                'required'   => 'O campo username é obrigatório',
                'max_length' => 'O campo username não pode exceder 255 caracteres',
            ],
            'password_hash' => [
                'required'   => 'O campo password_hash é obrigatório',
                'max_length' => 'O campo password_hash não pode exceder 255 caracteres',
            ],
        ];
    }
}
