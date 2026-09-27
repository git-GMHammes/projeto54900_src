<?php

namespace App\Requests\V1\Timeline\TimelinePostRatings;

/**
 * Regras de entrada do PUT /api/v1/timeline-post-ratings/update/{id}.
 *
 * Trocar a nota da propria avaliacao (mesmo intervalo 1..5).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'rating' => 'permit_empty|integer|greater_than_equal_to[1]|less_than_equal_to[5]',
        ];
    }

    public function messages(): array
    {
        return [
            'rating' => [
                'integer'               => 'A nota deve ser um numero inteiro',
                'greater_than_equal_to' => 'A nota minima e 1',
                'less_than_equal_to'    => 'A nota maxima e 5',
            ],
        ];
    }
}
