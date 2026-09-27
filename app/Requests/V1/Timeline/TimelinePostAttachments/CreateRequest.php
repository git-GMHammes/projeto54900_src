<?php

namespace App\Requests\V1\Timeline\TimelinePostAttachments;

/**
 * Regras de entrada do POST /api/v1/timeline-post-attachments/create.
 *
 * O create e multipart: `timeline_post_id` vem no corpo e os metadados do
 * arquivo (file_key, stored_name, storage_path, file_url, mime_type, extension,
 * file_size, checksum_sha256, category) sao preenchidos pelo Processor a partir
 * do arquivo enviado — por isso todos sao opcionais aqui. `title`,
 * `description`, `sort_order` e `status` o usuario pode informar.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'timeline_post_id' => 'required|is_natural_no_zero',
            'title'            => 'permit_empty|string|max_length[255]',
            'description'      => 'permit_empty|string',
            'sort_order'       => 'permit_empty|integer',
            'status'           => 'permit_empty|in_list[active,inactive]',
            'category'         => 'permit_empty|in_list[image,video,audio,document,spreadsheet,presentation,pdf,archive,other]',
        ];
    }

    public function messages(): array
    {
        return [
            'timeline_post_id' => [
                'required'            => 'Informe a publicacao dona do anexo',
                'is_natural_no_zero' => 'Publicacao invalida',
            ],
            'status' => [
                'in_list' => 'Status invalido: use active ou inactive',
            ],
        ];
    }
}
