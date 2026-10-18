<?php

namespace App\Requests\V1\Product\ProductManager;

/**
 * Regras de entrada do POST /create da tabela product_manager.
 *
 * Tabela product_manager — produto. location_id (local), parent_id (kit/conjunto), stock_min e stock_max sao opcionais (NULL = sem ligacao/sem limite). company_id e carimbado pela sessao.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'parent_id' => 'permit_empty|is_natural_no_zero|is_not_unique[product_manager.id]',
            'location_id' => 'permit_empty|is_natural_no_zero|is_not_unique[location_manager.id]',
            'code' => 'required|string|max_length[60]',
            'name' => 'required|string|max_length[150]',
            'description' => 'permit_empty|string',
            'type' => 'permit_empty|string|max_length[50]',
            'status' => 'permit_empty|in_list[draft,active,inactive,discontinued]',
            'stock_min' => 'permit_empty|numeric|greater_than_equal_to[0]',
            'stock_max' => 'permit_empty|numeric|greater_than_equal_to[0]',
            'sort_order' => 'permit_empty|integer',
            'roles' => 'permit_empty',
        ];
    }

    public function messages(): array
    {
        return [
            'parent_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'location_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'code' => [
                'required' => 'Informe code',
            ],
            'name' => [
                'required' => 'Informe name',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use draft, active, inactive, discontinued',
            ],
        ];
    }
}
