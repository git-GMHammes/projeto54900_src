<?php

namespace App\Requests\V1\Timeline\TimelinePostReactions;

/**
 * Regras de entrada do POST /api/v1/timeline-post-reactions/create.
 *
 * Nao existe tela para esta tabela: like/dislike e acao de um clique. O
 * Processor usa INSERT na primeira vez e UPDATE do reaction_type se o usuario
 * ja reagiu (a UNIQUE timeline_post_id + user_manager_id e a rede de seguranca).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'timeline_post_id' => 'required|is_natural_no_zero',
            'user_manager_id'  => 'permit_empty|is_natural_no_zero',
            'reaction_type'    => 'required|in_list[like,dislike]',
        ];
    }

    public function messages(): array
    {
        return [
            'timeline_post_id' => [
                'required'            => 'Informe a publicacao da reacao',
                'is_natural_no_zero' => 'Publicacao invalida',
            ],
            'reaction_type' => [
                'required' => 'Informe a reacao: like ou dislike',
                'in_list'  => 'Reacao invalida: use like ou dislike',
            ],
        ];
    }
}
