<?php

namespace App\Requests\V1\List\ListManager;

/**
 * Regras de validacao para PUT /update/{id} (tabela list_manager).
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
            'slug'                => 'permit_empty|string|max_length[255]|regex_match[/^[a-z0-9]+(?:-[a-z0-9]+)*$/]',
            'table_name'          => 'permit_empty|string|max_length[255]',
            'title'               => 'permit_empty|string|max_length[255]',
            'description'         => 'permit_empty|string',
            'api_get_endpoint'    => 'permit_empty|string|max_length[255]',
            'api_search_endpoint' => 'permit_empty|string|max_length[255]',
            'roles'               => 'permit_empty|string|max_length[255]',
            'default_sort'        => 'permit_empty|string|max_length[255]',
            'default_order'       => 'permit_empty|in_list[asc,desc]',
            'default_limit'       => 'permit_empty|is_natural_no_zero',
            'limit_options_json'  => 'permit_empty',
            'status'              => 'permit_empty|in_list[draft,active,inactive]',
            'version'             => 'permit_empty|is_natural_no_zero',
        ];
    }

    public function messages(): array
    {
        return [
            'slug' => [
                'max_length'  => 'O campo slug nao pode exceder 255 caracteres',
                'regex_match' => 'O campo slug deve ser kebab-case (a-z, 0-9 e hifen)',
            ],
            'default_order' => [
                'in_list' => 'O campo default_order deve ser asc ou desc',
            ],
            'status' => [
                'in_list' => 'O campo status deve ser draft, active ou inactive',
            ],
        ];
    }
}
