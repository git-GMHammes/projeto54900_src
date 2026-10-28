<?php

namespace App\Requests\V1\Template\TempFooter;

/**
 * Regras de validacao para PUT /update/{id} (tabela temp_footer).
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
            'col1_title' => 'permit_empty|string|max_length[255]',
            'col1_text' => 'permit_empty|string',
            'col1_image' => 'permit_empty|string|max_length[500]',
            'col1_alt' => 'permit_empty|string|max_length[255]',
            'col2_title' => 'permit_empty|string|max_length[255]',
            'col2_text' => 'permit_empty|string',
            'col2_image' => 'permit_empty|string|max_length[500]',
            'col2_alt' => 'permit_empty|string|max_length[255]',
            'col3_title' => 'permit_empty|string|max_length[255]',
            'col3_text' => 'permit_empty|string',
            'col3_image' => 'permit_empty|string|max_length[500]',
            'col3_alt' => 'permit_empty|string|max_length[255]',
            'col4_title' => 'permit_empty|string|max_length[255]',
            'col4_text' => 'permit_empty|string',
            'col4_image' => 'permit_empty|string|max_length[500]',
            'col4_alt' => 'permit_empty|string|max_length[255]',
            'status' => 'permit_empty|in_list[draft,active,inactive]',
            'company_manager' => 'permit_empty',
        ];
    }
}
