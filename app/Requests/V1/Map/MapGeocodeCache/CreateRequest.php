<?php

namespace App\Requests\V1\Map\MapGeocodeCache;

/**
 * Regras de entrada do POST /api/v1/map-geocode-cache/create.
 *
 * Tabela map_geocode_cache — cache de geocodificacao (politica do Nominatim exige cache).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'query_hash'  => 'permit_empty|string|exact_length[64]|alpha_numeric',
            'query_text'  => 'required|string|max_length[500]',
            'provider'    => 'permit_empty|in_list[nominatim,viacep,ors]',
            'lat'         => 'permit_empty|decimal|greater_than_equal_to[-90]|less_than_equal_to[90]',
            'lng'         => 'permit_empty|decimal|greater_than_equal_to[-180]|less_than_equal_to[180]',
            'result_json' => 'permit_empty',
            'expires_at'  => 'permit_empty|valid_date[Y-m-d H:i:s]',
        ];
    }

    public function messages(): array
    {
        return [
            'query_text' => [
                'required' => 'Informe query_text',
            ],
            'provider' => [
                'in_list' => 'Valor invalido: use nominatim, viacep, ors',
            ],
            'lat' => [
                'greater_than_equal_to' => 'Valor fora da faixa (-90 a 90)',
                'less_than_equal_to' => 'Valor fora da faixa (-90 a 90)',
            ],
            'lng' => [
                'greater_than_equal_to' => 'Valor fora da faixa (-180 a 180)',
                'less_than_equal_to' => 'Valor fora da faixa (-180 a 180)',
            ],
        ];
    }
}
