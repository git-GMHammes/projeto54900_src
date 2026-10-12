<?php

namespace App\Requests\V1\Company\CompanyMembers;

/**
 * Regras de entrada do PUT /api/v1/company-members/update/{id}.
 *
 * Muda o status (active/removed) e/ou o papel (admin/member) do vinculo; empresa
 * e usuario sao imutaveis. Ao menos um dos dois e exigido (Processor).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'status' => 'permit_empty|in_list[pending,active,blocked,removed]',
            'role'   => 'permit_empty|in_list[admin,member]',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => ['in_list' => 'O status deve ser pending, active, blocked ou removed'],
            'role'   => ['in_list' => 'O papel deve ser admin ou member'],
        ];
    }
}
