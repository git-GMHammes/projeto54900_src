<?php

namespace App\Requests\V1\Timeline\TimelinePostReports;

/**
 * Regras de entrada do PUT /api/v1/timeline-post-reports/update/{id}.
 *
 * Rota de moderacao (adminonly): aqui o admin muda status, reviewed_by,
 * reviewed_at e review_note. O autor da denuncia nao atualiza pelo modulo.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'reason'       => 'permit_empty|in_list[spam,abuse,violence,nudity,hate,copyright,misinformation,other]',
            'description'  => 'permit_empty|string',
            'status'       => 'permit_empty|in_list[pending,reviewing,resolved,rejected]',
            'reviewed_by'  => 'permit_empty|is_natural_no_zero',
            'reviewed_at'  => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'review_note'  => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'reason' => [
                'in_list' => 'Motivo invalido: use spam, abuse, violence, nudity, hate, copyright, misinformation ou other',
            ],
            'status' => [
                'in_list' => 'Status invalido: use pending, reviewing, resolved ou rejected',
            ],
        ];
    }
}
