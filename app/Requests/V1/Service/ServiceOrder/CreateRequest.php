<?php

namespace App\Requests\V1\Service\ServiceOrder;

/**
 * Regras de entrada do POST /create da tabela service_order.
 *
 * Tabela service_order — pedido, orcamento e execucao do servico. status, created_by e as datas de andamento sao controlados pelo Processor (fluxo requested -> quoted -> accepted -> scheduled -> in_progress -> done).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'service_id' => 'required|is_natural_no_zero|is_not_unique[service_manager.id]',
            'parent_id' => 'permit_empty|is_natural_no_zero|is_not_unique[service_order.id]',
            'code' => 'permit_empty|string|max_length[60]',
            'customer_name' => 'permit_empty|string|max_length[150]',
            'customer_contact' => 'permit_empty|string|max_length[150]',
            'customer_document' => 'permit_empty|string|max_length[20]',
            'customer_user_id' => 'permit_empty|is_natural_no_zero|is_not_unique[user_manager.id]',
            'executor_user_id' => 'permit_empty|is_natural_no_zero|is_not_unique[user_manager.id]',
            'place' => 'permit_empty|string|max_length[255]',
            'quantity' => 'permit_empty|numeric|greater_than[0]',
            'billing_unit' => 'permit_empty|string|max_length[20]',
            'currency' => 'permit_empty|exact_length[3]',
            'quoted_price' => 'permit_empty|numeric|greater_than_equal_to[0]',
            'requested_at' => 'permit_empty|valid_date',
            'scheduled_at' => 'permit_empty|valid_date',
            'deadline_at' => 'permit_empty|valid_date',
            'notes' => 'permit_empty|string',
            'roles' => 'permit_empty',
        ];
    }

    public function messages(): array
    {
        return [
            'service_id' => [
                'required' => 'Informe service_id',
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'parent_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'customer_user_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'executor_user_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'quantity' => [
                'greater_than' => 'quantity deve ser maior que zero',
            ],
        ];
    }
}
