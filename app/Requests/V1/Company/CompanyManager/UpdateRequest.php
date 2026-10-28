<?php

namespace App\Requests\V1\Company\CompanyManager;

/**
 * Regras de validacao para PUT /update/{id} (tabela company_manager).
 * Atualizacao parcial: todos os campos permit_empty.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'name'     => 'permit_empty|string|max_length[255]',
            'slug'     => 'permit_empty|regex_match[/^[a-z0-9-]+$/]|max_length[100]',
            'document' => 'permit_empty|string|max_length[20]',
            'color_theme' => 'permit_empty|regex_match[/^[A-Za-z0-9_]+$/]|max_length[30]',
            'status'   => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'name' => [
                'max_length' => 'O campo name nao pode exceder 255 caracteres',
            ],
            'slug' => [
                'regex_match' => 'O campo slug aceita apenas letras minusculas, numeros e hifen',
                'max_length'  => 'O campo slug nao pode exceder 100 caracteres',
            ],
            'document' => [
                'max_length' => 'O campo document nao pode exceder 20 caracteres',
            ],
            'status' => [
                'in_list' => 'O campo status deve ser active ou inactive',
            ],
        ];
    }
}
