<?php

namespace App\Requests\V1\Product\ProductAttributes;

/**
 * Regras de entrada do POST /create da tabela product_attributes.
 *
 * Tabela product_attributes — uma linha por caracteristica (group_code, field_code, label, value, unit). O catalogo de grupos e campos fica em doc/json/produto.json.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'product_id' => 'required|is_natural_no_zero|is_not_unique[product_manager.id]',
            'group_code' => 'required|string|max_length[50]',
            'field_code' => 'required|string|max_length[50]',
            'label' => 'permit_empty|string|max_length[100]',
            'value' => 'permit_empty|string|max_length[500]',
            'unit' => 'permit_empty|string|max_length[30]',
            'sort_order' => 'permit_empty|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id' => [
                'required' => 'Informe product_id',
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'group_code' => [
                'required' => 'Informe group_code',
            ],
            'field_code' => [
                'required' => 'Informe field_code',
            ],
        ];
    }
}
