<?php

namespace App\Requests\V1\Movement\MovementManager;

/**
 * Regras de entrada do PUT /update/{id} da tabela movement_manager.
 *
 * Tabela movement_manager — movimento de produto (entrada, saida, separacao, desperdicio, encomenda). user_manager_id e carimbado pela sessao; o cliente nao o informa. Movimento aberto aceita ajustes e status done/cancelled; movimento finalizado nao muda.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'quantity' => 'permit_empty|numeric|greater_than[0]',
            'status' => 'permit_empty|in_list[done,cancelled]',
            'expected_at' => 'permit_empty|valid_date[Y-m-d]',
            'location_id' => 'permit_empty|is_natural_no_zero|is_not_unique[location_manager.id]',
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
            'location_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use done, cancelled',
            ],
            'quantity' => [
                'greater_than' => 'quantity deve ser maior que zero',
            ],
        ];
    }
}
