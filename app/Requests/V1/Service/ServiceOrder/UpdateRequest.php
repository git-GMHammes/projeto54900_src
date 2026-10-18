<?php

namespace App\Requests\V1\Service\ServiceOrder;

/**
 * Regras de entrada do PUT /update/{id} da tabela service_order.
 *
 * Tabela service_order — pedido, orcamento e execucao do servico. status, created_by e as datas de andamento sao controlados pelo Processor (fluxo requested -> quoted -> accepted -> scheduled -> in_progress -> done). Servico, pedido pai, code e data do pedido sao imutaveis.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
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
            'scheduled_at' => 'permit_empty|valid_date',
            'deadline_at' => 'permit_empty|valid_date',
            'notes' => 'permit_empty|string',
            'roles' => 'permit_empty',
            'status' => 'permit_empty|in_list[requested,quoted,accepted,scheduled,in_progress,done,cancelled,rejected]',
            'final_price' => 'permit_empty|numeric|greater_than_equal_to[0]',
            'started_at' => 'permit_empty|valid_date',
            'finished_at' => 'permit_empty|valid_date',
            'paid_at' => 'permit_empty|valid_date',
            'rating' => 'permit_empty|is_natural_no_zero|less_than_equal_to[5]',
            'feedback' => 'permit_empty|string',
            'cancel_reason' => 'permit_empty|string|max_length[255]',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_user_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'executor_user_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'quantity' => [
                'greater_than' => 'quantity deve ser maior que zero',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use requested, quoted, accepted, scheduled, in_progress, done, cancelled, rejected',
            ],
            'rating' => [
                'less_than_equal_to' => 'rating deve estar entre 1 e 5',
            ],
        ];
    }
}
