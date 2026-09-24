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
 *   user_role_id  BIGINT                              NULL  FK -> user_roles.id (ON DELETE SET NULL)
 *   last_login_at DATETIME                            NULL
 *
 * password_hash: min 8 / max 72 — 72 bytes é o limite do bcrypt (o excedente
 * seria ignorado em silêncio). password_hash_confirm é o 2º campo do
 * componente senha (double_field) — só validado aqui, nunca persistido
 * (descartado em Services\V1\User\UserManager\Processor::prepareData).
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
            'password_hash' => 'required|string|min_length[8]|max_length[72]',
            'password_hash_confirm' => 'required|matches[password_hash]',
            'token'         => 'permit_empty|string|max_length[255]',
            'user_role_id'  => 'permit_empty|is_natural_no_zero',
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
                'min_length' => 'O campo password_hash deve ter no mínimo 8 caracteres',
                'max_length' => 'O campo password_hash não pode exceder 72 caracteres',
            ],
            'password_hash_confirm' => [
                'required' => 'O campo password_hash_confirm é obrigatório',
                'matches'  => 'A confirmação de senha não coincide com a senha',
            ],
            'user_role_id' => [
                'is_natural_no_zero' => 'O campo user_role_id deve ser o id de um user_roles válido',
            ],
        ];
    }
}
