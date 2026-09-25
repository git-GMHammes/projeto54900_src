<?php

namespace App\Requests\V1\Auth;

/**
 * Regras de validação para PUT /auth/change-password.
 */
class ChangePasswordRequest
{
    public function rules(): array
    {
        return [
            'current_password' => 'required|string',
            'new_password'      => 'required|string|min_length[6]|max_length[255]|differs[current_password]',
        ];
    }

    public function messages(): array
    {
        return [
            'current_password' => [
                'required' => 'O campo current_password é obrigatório',
            ],
            'new_password' => [
                'required'   => 'O campo new_password é obrigatório',
                'min_length' => 'A nova senha deve ter no mínimo 6 caracteres',
                'max_length' => 'A nova senha não pode exceder 255 caracteres',
                'differs'    => 'A nova senha deve ser diferente da senha atual',
            ],
        ];
    }
}
