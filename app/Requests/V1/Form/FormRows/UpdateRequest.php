<?php

namespace App\Requests\V1\Form\FormRows;

/**
 * Regras de validacao para PUT /update/{id} (tabela form_rows).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se form_group_id vier,
 * a existencia da FK e reavaliada no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'form_group_id' => 'permit_empty|is_natural_no_zero',
            'sort_order'    => 'permit_empty|is_natural',
            'gutter'        => 'permit_empty|string|max_length[8]',
            'note'          => 'permit_empty|string|max_length[255]',
        ];
    }

    public function messages(): array
    {
        return [
            'form_group_id' => [
                'is_natural_no_zero' => 'O campo form_group_id deve ser um inteiro maior que zero',
            ],
        ];
    }
}
