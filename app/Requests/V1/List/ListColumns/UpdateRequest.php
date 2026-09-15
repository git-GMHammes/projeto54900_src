<?php

namespace App\Requests\V1\List\ListColumns;

/**
 * Regras de validacao para PUT /update/{id} (tabela list_columns).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se list_manager_id vier,
 * a existencia da FK e reavaliada no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'list_manager_id'  => 'permit_empty|is_natural_no_zero',
            'sort_order'       => 'permit_empty|is_natural',
            'label'            => 'permit_empty|string|max_length[255]',
            'field_key'        => 'permit_empty|string|max_length[255]',
            'concat_json'      => 'permit_empty',
            'format'           => 'permit_empty|string|max_length[30]',
            'cell_class'       => 'permit_empty|string|max_length[120]',
            'fallback'         => 'permit_empty|string|max_length[50]',
            'sortable'         => 'permit_empty|in_list[0,1]',
            'sort_key'         => 'permit_empty|string|max_length[255]',
            'sort_concat_json' => 'permit_empty',
            'visible'          => 'permit_empty|in_list[0,1]',
        ];
    }

    public function messages(): array
    {
        return [
            'list_manager_id' => [
                'is_natural_no_zero' => 'O campo list_manager_id deve ser um inteiro maior que zero',
            ],
            'label' => [
                'max_length' => 'O campo label nao pode exceder 255 caracteres',
            ],
        ];
    }
}
