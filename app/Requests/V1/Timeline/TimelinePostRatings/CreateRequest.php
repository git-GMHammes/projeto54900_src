<?php

namespace App\Requests\V1\Timeline\TimelinePostRatings;

/**
 * Regras de entrada do POST /api/v1/timeline-post-ratings/create.
 *
 * O intervalo 1..5 e validado aqui e reconferido no Processor (o banco nao usa
 * CHECK). Uma avaliacao por usuario por post (UNIQUE), como no like/dislike.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'timeline_post_id' => 'required|is_natural_no_zero',
            'user_manager_id'  => 'permit_empty|is_natural_no_zero',
            'rating'           => 'required|integer|greater_than_equal_to[1]|less_than_equal_to[5]',
        ];
    }

    public function messages(): array
    {
        return [
            'timeline_post_id' => [
                'required'            => 'Informe a publicacao avaliada',
                'is_natural_no_zero' => 'Publicacao invalida',
            ],
            'rating' => [
                'required'                => 'Informe a nota de 1 a 5',
                'integer'                 => 'A nota deve ser um numero inteiro',
                'greater_than_equal_to'   => 'A nota minima e 1',
                'less_than_equal_to'      => 'A nota maxima e 5',
            ],
        ];
    }
}
