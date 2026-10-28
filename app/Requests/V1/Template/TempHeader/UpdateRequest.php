<?php

namespace App\Requests\V1\Template\TempHeader;

/**
 * Regras de validacao para PUT /update/{id} (tabela temp_header).
 *
 * Todos os campos sao opcionais. company_manager (lista de slugs) e validado no
 * Processor (existencia dos slugs e empresa da sessao); sem ele, no create, vale a
 * empresa da sessao. status so muda por update.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'name' => 'permit_empty|string|max_length[100]',
            'sort_order' => 'permit_empty|is_natural',
            'background_image' => 'permit_empty|string|max_length[500]',
            'background_alt' => 'permit_empty|string|max_length[255]',
            'logo_left_text' => 'permit_empty|string|max_length[255]',
            'logo_left_image' => 'permit_empty|string|max_length[500]',
            'logo_left_alt' => 'permit_empty|string|max_length[255]',
            'logo_center_text' => 'permit_empty|string|max_length[255]',
            'logo_center_image' => 'permit_empty|string|max_length[500]',
            'logo_center_alt' => 'permit_empty|string|max_length[255]',
            'logo_right_text' => 'permit_empty|string|max_length[255]',
            'logo_right_image' => 'permit_empty|string|max_length[500]',
            'logo_right_alt' => 'permit_empty|string|max_length[255]',
            'company_name' => 'permit_empty|string|max_length[255]',
            'status' => 'permit_empty|in_list[draft,active,inactive]',
            'company_manager' => 'permit_empty',
        ];
    }
}
