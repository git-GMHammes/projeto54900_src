<?php

namespace App\Requests\V1\User\UserRoles;

/**
 * Regras de validacao para PUT /update/{id} (tabela user_roles).
 *
 * Atualizacao parcial: todos os campos permit_empty. Unicidade de slug
 * (excluindo o proprio id) e verificada no hook validateOnUpdate (Processor).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'name'        => 'permit_empty|string|max_length[100]',
            'slug'        => 'permit_empty|string|max_length[100]|regex_match[/^[a-z0-9]+(?:-[a-z0-9]+)*$/]',
            'description' => 'permit_empty|string|max_length[255]',
            'permissions' => 'permit_empty',
            'status'      => 'permit_empty|in_list[0,1]',
        ];
    }

    public function messages(): array
    {
        return [
            'name' => [
                'max_length' => 'O campo name nao pode exceder 100 caracteres',
            ],
            'slug' => [
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
