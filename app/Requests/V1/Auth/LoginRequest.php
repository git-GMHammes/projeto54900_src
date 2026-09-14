<?php

namespace App\Requests\V1\Auth;

/**
 * Regras de validação para POST /auth/login.
 */
class LoginRequest
{
    public function rules(): array
    {
        return [
            'username' => 'required|string|max_length[255]',
            'password' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'username' => [
                'required' => 'O campo username é obrigatório',
            ],
            'password' => [
                'required' => 'O campo password é obrigatório',
            ],
        ];
    }
}
