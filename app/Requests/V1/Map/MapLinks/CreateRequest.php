<?php

namespace App\Requests\V1\Map\MapLinks;

/**
 * Regras de entrada do POST /api/v1/map-links/create.
 *
 * Tabela map_links — vinculo universal modulo <-> mapa (CEP, endereco, ponto ou rota).
 * `user_manager_id` e preenchido pela sessao quando nao vem no corpo.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'module'             => 'required|string|alpha_dash|max_length[100]',
            'reference_id'       => 'required|is_natural_no_zero',
            'collection'         => 'permit_empty|string|alpha_dash|max_length[100]',
            'link_type'          => 'required|in_list[postal_code,address,point,route]',
            'map_postal_code_id' => 'permit_empty|is_natural_no_zero|is_not_unique[map_postal_codes.id]',
            'map_address_id'     => 'permit_empty|is_natural_no_zero|is_not_unique[map_addresses.id]',
            'map_point_id'       => 'permit_empty|is_natural_no_zero|is_not_unique[map_points.id]',
            'map_route_id'       => 'permit_empty|is_natural_no_zero|is_not_unique[map_routes.id]',
            'label'              => 'permit_empty|string|max_length[255]',
            'sort_order'         => 'permit_empty|integer',
            'status'             => 'permit_empty|in_list[active,inactive]',
            'user_manager_id'    => 'permit_empty|is_natural_no_zero|is_not_unique[user_manager.id]',
        ];
    }

    public function messages(): array
    {
        return [
            'module' => [
                'required' => 'Informe module',
                'alpha_dash' => 'Use apenas letras, numeros, hifen e sublinhado',
            ],
            'reference_id' => [
                'required' => 'Informe reference_id',
            ],
            'collection' => [
                'alpha_dash' => 'Use apenas letras, numeros, hifen e sublinhado',
            ],
            'link_type' => [
                'required' => 'Informe link_type',
                'in_list' => 'Valor invalido: use postal_code, address, point, route',
            ],
            'map_postal_code_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'map_address_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'map_point_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'map_route_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use active, inactive',
            ],
            'user_manager_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
        ];
    }
}
