<?php

namespace App\Requests\V1\Map\MapAddresses;

/**
 * Regras de entrada do PUT /api/v1/map-addresses/update/{id}.
 *
 * Tabela map_addresses — endereco estruturado e georreferenciado.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'map_postal_code_id' => 'permit_empty|is_natural_no_zero|is_not_unique[map_postal_codes.id]',
            'cep'                => 'permit_empty|string|max_length[9]',
            'street'             => 'permit_empty|string|max_length[255]',
            'number'             => 'permit_empty|string|max_length[20]',
            'complement'         => 'permit_empty|string|max_length[150]',
            'neighborhood'       => 'permit_empty|string|max_length[150]',
            'city'               => 'permit_empty|string|max_length[150]',
            'state'              => 'permit_empty|string|exact_length[2]',
            'country'            => 'permit_empty|string|exact_length[2]',
            'lat'                => 'permit_empty|decimal|greater_than_equal_to[-90]|less_than_equal_to[90]',
            'lng'                => 'permit_empty|decimal|greater_than_equal_to[-180]|less_than_equal_to[180]',
            'geocode_source'     => 'permit_empty|in_list[nominatim,viacep,manual]',
            'geocode_precision'  => 'permit_empty|in_list[rooftop,street,postal_code,city,approximate]',
            'osm_type'           => 'permit_empty|string|max_length[20]',
            'osm_id'             => 'permit_empty|is_natural',
            'display_name'       => 'permit_empty|string|max_length[500]',
        ];
    }

    public function messages(): array
    {
        return [
            'map_postal_code_id' => [
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
            'geocode_source' => [
                'in_list' => 'Valor invalido: use nominatim, viacep, manual',
            ],
            'geocode_precision' => [
                'in_list' => 'Valor invalido: use rooftop, street, postal_code, city, approximate',
            ],
        ];
    }
}
