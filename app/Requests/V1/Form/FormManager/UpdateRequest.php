<?php

namespace App\Requests\V1\Form\FormManager;

/**
 * Regras de validacao para PUT /update/{id} (tabela form_manager).
 *
 * Todos os campos sao permit_empty (atualizacao parcial). status E mutavel
 * aqui (draft/active/inactive). Unicidade de slug (com excludeId) e verificada
 * no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'slug'            => 'permit_empty|string|max_length[255]|regex_match[/^[a-z0-9]+(?:-[a-z0-9]+)*$/]',
            'table_name'      => 'permit_empty|string|max_length[255]|regex_match[/^[a-z][a-z0-9_]*$/]',
            'title'           => 'permit_empty|string|max_length[255]',
            'description'     => 'permit_empty|string',
            'roles'           => 'permit_empty|string|max_length[255]',
            'react_route'     => 'permit_empty|string|max_length[255]',
            'submit_endpoint' => 'permit_empty|string|max_length[255]',
            'http_method'     => 'permit_empty|in_list[GET,POST,PUT,PATCH,DELETE]',
            'status'          => 'permit_empty|in_list[draft,active,inactive]',
            'version'         => 'permit_empty|is_natural_no_zero',
        ];
    }

    public function messages(): array
    {
        return [
            'slug' => [
                'max_length'  => 'O campo slug nao pode exceder 255 caracteres',
                'regex_match' => 'O campo slug deve ser kebab-case (a-z, 0-9 e hifen)',
            ],
            'table_name' => [
                'max_length'  => 'O campo table_name nao pode exceder 255 caracteres',
                'regex_match' => 'O campo table_name deve ser snake_case (a-z, 0-9 e underscore, iniciando com letra)',
            ],
            'status' => [
                'in_list' => 'O campo status deve ser draft, active ou inactive',
            ],
        ];
    }
}
