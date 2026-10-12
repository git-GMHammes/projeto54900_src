<?php

namespace App\Requests\V1\Map\MapRouteStops;

/**
 * Regras de entrada do POST /api/v1/map-route-stops/create.
 *
 * Tabela map_route_stops — paradas do trajeto, com distancia e tempo do trecho.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'map_route_id'   => 'required|is_natural_no_zero|is_not_unique[map_routes.id]',
            'map_point_id'   => 'permit_empty|is_natural_no_zero|is_not_unique[map_points.id]',
            'map_address_id' => 'permit_empty|is_natural_no_zero|is_not_unique[map_addresses.id]',
            'label'          => 'permit_empty|string|max_length[255]',
            'lat'            => 'required|decimal|greater_than_equal_to[-90]|less_than_equal_to[90]',
            'lng'            => 'required|decimal|greater_than_equal_to[-180]|less_than_equal_to[180]',
            'sort_order'     => 'permit_empty|integer',
            'leg_distance_m' => 'permit_empty|is_natural',
            'leg_duration_s' => 'permit_empty|is_natural',
            'service_time_s' => 'permit_empty|is_natural',
            'eta'            => 'permit_empty|valid_date[Y-m-d H:i:s]',
        ];
    }

    public function messages(): array
    {
        return [
            'map_route_id' => [
                'required' => 'Informe map_route_id',
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'map_point_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'map_address_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'lat' => [
                'required' => 'Informe lat',
                'greater_than_equal_to' => 'Valor fora da faixa (-90 a 90)',
                'less_than_equal_to' => 'Valor fora da faixa (-90 a 90)',
            ],
            'lng' => [
                'required' => 'Informe lng',
                'greater_than_equal_to' => 'Valor fora da faixa (-180 a 180)',
                'less_than_equal_to' => 'Valor fora da faixa (-180 a 180)',
            ],
        ];
    }
}
