<?php

namespace App\Requests\V1\Map\MapRoutes;

/**
 * Regras de entrada do PUT /api/v1/map-routes/update/{id}.
 *
 * Tabela map_routes — trajetos calculados (OpenRouteService).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'map_manager_id'  => 'permit_empty|is_natural_no_zero|is_not_unique[map_manager.id]',
            'user_manager_id' => 'permit_empty|is_natural_no_zero|is_not_unique[user_manager.id]',
            'name'            => 'permit_empty|string|max_length[255]',
            'profile'         => 'permit_empty|in_list[driving-car,driving-hgv,cycling-regular,foot-walking]',
            'distance_m'      => 'permit_empty|is_natural',
            'duration_s'      => 'permit_empty|is_natural',
            'geometry'        => 'permit_empty|string',
            'bbox'            => 'permit_empty',
            'provider'        => 'permit_empty|string|max_length[30]',
            'options_json'    => 'permit_empty',
            'calculated_at'   => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'status'          => 'permit_empty|in_list[draft,active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'map_manager_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'user_manager_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'profile' => [
                'in_list' => 'Valor invalido: use driving-car, driving-hgv, cycling-regular, foot-walking',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use draft, active, inactive',
            ],
        ];
    }
}
