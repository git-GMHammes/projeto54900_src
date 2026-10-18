<?php

namespace App\Requests\V1\Location\LocationTypes;

/**
 * Regras de entrada do POST /api/v1/location-types/create.
 *
 * Tabela location_types — tipo (rotulo) de local, global.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'code'       => 'required|string|alpha_dash|max_length[50]',
            'name'       => 'required|string|max_length[100]',
            'icon'       => 'permit_empty|string|max_length[100]',
            'sort_order' => 'permit_empty|integer',
            'status'     => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'code' => [
                'required' => 'Informe code',
                'alpha_dash' => 'Use apenas letras, numeros, hifen e sublinhado',
            ],
            'name' => [
                'required' => 'Informe name',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use active, inactive',
            ],
        ];
    }
}
