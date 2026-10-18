<?php

namespace App\Requests\V1\Location\LocationTypes;

/**
 * Regras de entrada do PUT /api/v1/location-types/update/{id}.
 *
 * Tabela location_types — tipo (rotulo) de local, global.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'code'       => 'permit_empty|string|alpha_dash|max_length[50]',
            'name'       => 'permit_empty|string|max_length[100]',
            'icon'       => 'permit_empty|string|max_length[100]',
            'sort_order' => 'permit_empty|integer',
            'status'     => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'code' => [
                'alpha_dash' => 'Use apenas letras, numeros, hifen e sublinhado',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use active, inactive',
            ],
        ];
    }
}
