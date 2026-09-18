<?php

namespace App\Requests\V1\User\UserManager;

/**
 * Regras de validação para PUT /update/{id} (tabela user_manager).
 *
 * password_hash É mutável por este endpoint — opcional (permit_empty): enviar
 * vazio/ausente mantém a senha atual, enviar um valor troca a senha (hash
 * aplicado em Services\V1\User\UserManager\Processor::prepareUpdateData).
 *
 * status É mutável por este endpoint (active/inactive/blocked) — a restrição
 * de "todo novo usuário nasce com o DEFAULT" se aplica apenas ao CREATE
 * (ver Requests\V1\User\UserManager\CreateRequest).
 *
 * user_role_id é BIGINT NULL — FK -> user_roles.id (ON DELETE SET NULL). Enviar
 * vazio limpa o vínculo; a existência do id é checada no Processor (422).
 *
 * token é o hash do refresh token JWT, escrito e renovado exclusivamente por
 * Services\V1\Auth\AuthService (login/refresh/logout) — a regra abaixo é
 * pré-existente (aceita no payload), mas nenhum formulário/tela deste módulo
 * deve enviar esse campo manualmente.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'username'      => 'permit_empty|string|max_length[255]',
            'password_hash' => 'permit_empty|string|min_length[6]|max_length[255]',
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
            'password_hash' => [
                'min_length' => 'O campo password_hash deve ter no mínimo 6 caracteres',
                'max_length' => 'O campo password_hash não pode exceder 255 caracteres',
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
