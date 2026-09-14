<?php

namespace App\Requests\V1\Auth;

/**
 * Regras de validação para POST /auth/refresh.
 */
class RefreshRequest
{
    public function rules(): array
    {
        return [
            'refresh_token' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'refresh_token' => [
                'required' => 'O campo refresh_token é obrigatório',
            ],
        ];
    }
}
