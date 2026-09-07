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
 *
 * user_role_id é BIGINT NULL — FK -> user_roles.id (ON DELETE SET NULL). Enviar
 * vazio limpa o vínculo; a existência do id é checada no Processor (422).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'username'      => 'permit_empty|string|max_length[255]',
            'token'         => 'permit_empty|string|max_length[255]',
            'status'        => 'permit_empty|in_list[active,inactive,blocked]',
            'user_role_id'  => 'permit_empty|is_natural_no_zero',
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
            'user_role_id' => [
                'is_natural_no_zero' => 'O campo user_role_id deve ser o id de um user_roles válido',
            ],
        ];
    }
}
