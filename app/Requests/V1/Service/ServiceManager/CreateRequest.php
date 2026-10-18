<?php

namespace App\Requests\V1\Service\ServiceManager;

/**
 * Regras de entrada do POST /create da tabela service_manager.
 *
 * Tabela service_manager — catalogo de servicos. parent_id (pacote/obra) e opcional; provider_type: biscate (autonomo informal), mei ou company (CNPJ). company_id e carimbado pela sessao.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'parent_id' => 'permit_empty|is_natural_no_zero|is_not_unique[service_manager.id]',
            'code' => 'required|string|max_length[60]',
            'name' => 'required|string|max_length[150]',
            'description' => 'permit_empty|string',
            'type' => 'permit_empty|string|max_length[50]',
            'provider_type' => 'permit_empty|in_list[biscate,mei,company]',
            'provider_document' => 'permit_empty|string|max_length[20]',
            'billing_unit' => 'permit_empty|string|max_length[20]',
            'price' => 'permit_empty|numeric|greater_than_equal_to[0]',
            'currency' => 'permit_empty|exact_length[3]',
            'duration' => 'permit_empty|numeric|greater_than_equal_to[0]',
            'duration_unit' => 'permit_empty|in_list[min,h,d,wk,mo]',
            'lead_time' => 'permit_empty|numeric|greater_than_equal_to[0]',
            'lead_time_unit' => 'permit_empty|in_list[min,h,d,wk,mo]',
            'status' => 'permit_empty|in_list[draft,active,inactive,discontinued]',
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
            'code' => [
                'required' => 'Informe code',
            ],
            'name' => [
                'required' => 'Informe name',
            ],
            'provider_type' => [
                'in_list' => 'Valor invalido: use biscate, mei, company',
            ],
            'duration_unit' => [
                'in_list' => 'Valor invalido: use min, h, d, wk, mo',
            ],
            'lead_time_unit' => [
                'in_list' => 'Valor invalido: use min, h, d, wk, mo',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use draft, active, inactive, discontinued',
            ],
        ];
    }
}
