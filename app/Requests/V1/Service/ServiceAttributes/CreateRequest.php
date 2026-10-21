<?php

namespace App\Requests\V1\Service\ServiceAttributes;

/**
 * Regras de entrada do POST /create da tabela service_attributes.
 *
 * Tabela service_attributes — uma linha por caracteristica (group_code, field_code, label, value, unit). O catalogo de grupos e campos fica em doc/json/servico.json.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'service_id' => 'required|is_natural_no_zero|is_not_unique[service_manager.id]',
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
            'service_id' => [
                'required' => 'Informe service_id',
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
