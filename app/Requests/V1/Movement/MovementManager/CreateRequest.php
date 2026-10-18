<?php

namespace App\Requests\V1\Movement\MovementManager;

/**
 * Regras de entrada do POST /create da tabela movement_manager.
 *
 * Tabela movement_manager — movimento de produto (entrada, saida, separacao, desperdicio, encomenda). user_manager_id e carimbado pela sessao; o cliente nao o informa.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'product_id' => 'required|is_natural_no_zero|is_not_unique[product_manager.id]',
            'type' => 'required|in_list[entry,exit,reservation,waste,order]',
            'quantity' => 'required|numeric|greater_than[0]',
            'status' => 'permit_empty|in_list[open,done,cancelled]',
            'occurred_at' => 'permit_empty|valid_date',
            'expected_at' => 'permit_empty|valid_date[Y-m-d]',
            'location_id' => 'permit_empty|is_natural_no_zero|is_not_unique[location_manager.id]',
            'origin_id' => 'permit_empty|is_natural_no_zero|is_not_unique[movement_manager.id]',
            'lot' => 'permit_empty|string|max_length[60]',
            'expires_at' => 'permit_empty|valid_date[Y-m-d]',
            'unit_cost' => 'permit_empty|numeric|greater_than_equal_to[0]',
            'reason' => 'permit_empty|string|max_length[150]',
            'reference' => 'permit_empty|string|max_length[100]',
            'notes' => 'permit_empty|string',
            'roles' => 'permit_empty',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id' => [
                'required' => 'Informe product_id',
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'type' => [
                'required' => 'Informe type',
                'in_list' => 'Valor invalido: use entry, exit, reservation, waste, order',
            ],
            'quantity' => [
                'required' => 'Informe quantity',
                'greater_than' => 'quantity deve ser maior que zero',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use open, done, cancelled',
            ],
            'location_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'origin_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
        ];
    }
}
