<?php

namespace App\Requests\V1\Map\MapManager;

/**
 * Regras de entrada do POST /api/v1/map-manager/create.
 *
 * Tabela map_manager — o mapa: centro, zoom e fonte de tiles.
 * `user_manager_id` e preenchido pela sessao quando nao vem no corpo.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'user_manager_id' => 'permit_empty|is_natural_no_zero|is_not_unique[user_manager.id]',
            'slug'            => 'permit_empty|string|alpha_dash|max_length[150]',
            'title'           => 'required|string|max_length[255]',
            'description'     => 'permit_empty|string',
            'center_lat'      => 'required|decimal|greater_than_equal_to[-90]|less_than_equal_to[90]',
            'center_lng'      => 'required|decimal|greater_than_equal_to[-180]|less_than_equal_to[180]',
            'zoom'            => 'permit_empty|is_natural_no_zero|less_than_equal_to[22]',
            'min_zoom'        => 'permit_empty|is_natural_no_zero|less_than_equal_to[22]',
            'max_zoom'        => 'permit_empty|is_natural_no_zero|less_than_equal_to[22]',
            'tile_url'        => 'permit_empty|string|max_length[500]',
            'attribution'     => 'permit_empty|string|max_length[500]',
            'roles'           => 'permit_empty',
            'status'          => 'permit_empty|in_list[draft,active,inactive]',
            'version'         => 'permit_empty|is_natural',
        ];
    }

    public function messages(): array
    {
        return [
            'user_manager_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'slug' => [
                'alpha_dash' => 'Use apenas letras, numeros, hifen e sublinhado',
            ],
            'title' => [
                'required' => 'Informe title',
            ],
            'center_lat' => [
                'required' => 'Informe center_lat',
                'greater_than_equal_to' => 'Valor fora da faixa (-90 a 90)',
                'less_than_equal_to' => 'Valor fora da faixa (-90 a 90)',
            ],
            'center_lng' => [
                'required' => 'Informe center_lng',
                'greater_than_equal_to' => 'Valor fora da faixa (-180 a 180)',
                'less_than_equal_to' => 'Valor fora da faixa (-180 a 180)',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use draft, active, inactive',
            ],
        ];
    }
}
