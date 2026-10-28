<?php

namespace App\Requests\V1\Template\TempManager;

/**
 * Regras de validacao para PUT /update/{id} (tabela temp_manager).
 *
 * code nao pode mudar (422 no Processor). company_manager pode ser lista vazia (template sem
 * empresa); slugs existentes e sem repeticao entre templates ativos sao validados no Processor.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'code'            => 'permit_empty|regex_match[/^[a-z0-9]+$/]|max_length[30]',
            'name'            => 'permit_empty|string|max_length[100]',
            'description'     => 'permit_empty|string|max_length[255]',
            'status'          => 'permit_empty|in_list[draft,active,inactive]',
            'company_manager' => 'permit_empty',
        ];
    }
}
