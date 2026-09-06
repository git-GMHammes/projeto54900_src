<?php

namespace App\Requests\V1\User\UserManager;

/**
 * Regras de validação para PUT /update/{id} (tabela user_manager).
 *
 * password_hash não é mutável por este endpoint —
 * a troca de senha é tratada por fluxo dedicado.
 *
 * status É mutável por este endpoint (active/inactive/blocked) — a restrição
 * de "todo novo usuário nasce com o DEFAULT" se aplica apenas ao CREATE
 * (ver Requests\V1\User\UserManager\CreateRequest).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'username'      => 'permit_empty|string|max_length[255]',
            'token'         => 'permit_empty|string|max_length[255]',
            'status'        => 'permit_empty|in_list[active,inactive,blocked]',
            'last_login_at' => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'username' => [
                'max_length' => 'O campo username não pode exceder 255 caracteres',
            ],
            'status' => [
                'in_list' => 'O campo status deve ser active, inactive ou blocked',
            ],
        ];
    }
}
