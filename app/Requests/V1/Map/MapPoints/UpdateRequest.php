<?php

namespace App\Requests\V1\Map\MapPoints;

/**
 * Regras de entrada do PUT /api/v1/map-points/update/{id}.
 *
 * Tabela map_points — pontos no mapa.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'map_manager_id'  => 'permit_empty|is_natural_no_zero|is_not_unique[map_manager.id]',
            'map_category_id' => 'permit_empty|is_natural_no_zero|is_not_unique[map_categories.id]',
            'map_icon_id'     => 'permit_empty|is_natural_no_zero|is_not_unique[map_icons.id]',
            'map_address_id'  => 'permit_empty|is_natural_no_zero|is_not_unique[map_addresses.id]',
            'user_manager_id' => 'permit_empty|is_natural_no_zero|is_not_unique[user_manager.id]',
            'name'            => 'permit_empty|string|max_length[255]',
            'description'     => 'permit_empty|string',
            'lat'             => 'permit_empty|decimal|greater_than_equal_to[-90]|less_than_equal_to[90]',
            'lng'             => 'permit_empty|decimal|greater_than_equal_to[-180]|less_than_equal_to[180]',
            'extra_json'      => 'permit_empty',
            'status'          => 'permit_empty|in_list[draft,active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'map_manager_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'map_category_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'map_icon_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'map_address_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'user_manager_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'lat' => [
                'greater_than_equal_to' => 'Valor fora da faixa (-90 a 90)',
                'less_than_equal_to' => 'Valor fora da faixa (-90 a 90)',
            ],
            'lng' => [
                'greater_than_equal_to' => 'Valor fora da faixa (-180 a 180)',
                'less_than_equal_to' => 'Valor fora da faixa (-180 a 180)',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use draft, active, inactive',
            ],
        ];
    }
}
