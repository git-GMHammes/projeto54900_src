<?php

namespace App\Requests\V1\Map\MapCategories;

/**
 * Regras de entrada do POST /api/v1/map-categories/create.
 *
 * Tabela map_categories — categoria de ponto, por mapa.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'map_manager_id' => 'required|is_natural_no_zero|is_not_unique[map_manager.id]',
            'map_icon_id'    => 'permit_empty|is_natural_no_zero|is_not_unique[map_icons.id]',
            'name'           => 'required|string|max_length[150]',
            'slug'           => 'permit_empty|string|alpha_dash|max_length[150]',
            'color'          => 'permit_empty|string|max_length[20]',
            'sort_order'     => 'permit_empty|integer',
            'status'         => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'map_manager_id' => [
                'required' => 'Informe map_manager_id',
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'map_icon_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'name' => [
                'required' => 'Informe name',
            ],
            'slug' => [
                'alpha_dash' => 'Use apenas letras, numeros, hifen e sublinhado',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use active, inactive',
            ],
        ];
    }
}
