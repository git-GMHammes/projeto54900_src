<?php

namespace App\Requests\V1\Map\MapPostalCodes;

/**
 * Regras de entrada do POST /api/v1/map-postal-codes/create.
 *
 * Tabela map_postal_codes — base de CEP (logradouro, bairro, cidade) com coordenada.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'cep'          => 'required|string|max_length[9]',
            'street'       => 'permit_empty|string|max_length[255]',
            'neighborhood' => 'permit_empty|string|max_length[150]',
            'city'         => 'permit_empty|string|max_length[150]',
            'state'        => 'permit_empty|string|exact_length[2]',
            'ibge_code'    => 'permit_empty|string|max_length[10]',
            'lat'          => 'permit_empty|decimal|greater_than_equal_to[-90]|less_than_equal_to[90]',
            'lng'          => 'permit_empty|decimal|greater_than_equal_to[-180]|less_than_equal_to[180]',
            'source'       => 'permit_empty|in_list[viacep,nominatim,manual]',
        ];
    }

    public function messages(): array
    {
        return [
            'cep' => [
                'required' => 'Informe cep',
            ],
            'lat' => [
                'greater_than_equal_to' => 'Valor fora da faixa (-90 a 90)',
                'less_than_equal_to' => 'Valor fora da faixa (-90 a 90)',
            ],
            'lng' => [
                'greater_than_equal_to' => 'Valor fora da faixa (-180 a 180)',
                'less_than_equal_to' => 'Valor fora da faixa (-180 a 180)',
            ],
            'source' => [
                'in_list' => 'Valor invalido: use viacep, nominatim, manual',
            ],
        ];
    }
}
