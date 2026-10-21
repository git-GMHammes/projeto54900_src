<?php

namespace App\Requests\V1\Location\LocationManager;

/**
 * Regras de entrada do PUT /api/v1/location-manager/update/{id}.
 *
 * Tabela location_manager — local hierarquico. parent_id aceita null para
 * desligar o local do pai (volta ao topo da arvore).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'parent_id'        => 'permit_empty|is_natural_no_zero|is_not_unique[location_manager.id]',
            'location_type_id' => 'permit_empty|is_natural_no_zero|is_not_unique[location_types.id]',
            'name'             => 'permit_empty|string|max_length[150]',
            'code'             => 'permit_empty|string|max_length[60]',
            'description'      => 'permit_empty|string',
            'latitude'         => 'permit_empty|numeric|greater_than_equal_to[-90]|less_than_equal_to[90]',
            'longitude'        => 'permit_empty|numeric|greater_than_equal_to[-180]|less_than_equal_to[180]',
            'sort_order'       => 'permit_empty|integer',
            'status'           => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'parent_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'location_type_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'latitude' => [
                'greater_than_equal_to' => 'Latitude deve estar entre -90 e 90',
                'less_than_equal_to' => 'Latitude deve estar entre -90 e 90',
            ],
            'longitude' => [
                'greater_than_equal_to' => 'Longitude deve estar entre -180 e 180',
                'less_than_equal_to' => 'Longitude deve estar entre -180 e 180',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use active, inactive',
            ],
        ];
    }
}
