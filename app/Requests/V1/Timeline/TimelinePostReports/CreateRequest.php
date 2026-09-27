<?php

namespace App\Requests\V1\Timeline\TimelinePostReports;

/**
 * Regras de entrada do POST /api/v1/timeline-post-reports/create.
 *
 * Denunciar e de qualquer usuario logado. Os campos de moderacao (status,
 * reviewed_by, reviewed_at, review_note) existem para o admin: o Processor
 * apaga o que vier deles quando quem envia nao e admin. Uma denuncia por
 * usuario por post (UNIQUE).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'timeline_post_id' => 'required|is_natural_no_zero',
            'user_manager_id'  => 'permit_empty|is_natural_no_zero',
            'reason'           => 'required|in_list[spam,abuse,violence,nudity,hate,copyright,misinformation,other]',
            'description'      => 'permit_empty|string',
            'status'           => 'permit_empty|in_list[pending,reviewing,resolved,rejected]',
            'reviewed_by'      => 'permit_empty|is_natural_no_zero',
            'reviewed_at'      => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'review_note'      => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'timeline_post_id' => [
                'required'            => 'Informe a publicacao denunciada',
                'is_natural_no_zero' => 'Publicacao invalida',
            ],
            'reason' => [
                'required' => 'Informe o motivo da denuncia',
                'in_list'  => 'Motivo invalido: use spam, abuse, violence, nudity, hate, copyright, misinformation ou other',
            ],
        ];
    }
}
