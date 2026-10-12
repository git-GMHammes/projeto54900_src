<?php

namespace App\Requests\V1\Company\CompanyMembers;

/**
 * Regras de entrada do POST /api/v1/company-members/create.
 *
 * Adiciona (ou reativa) um usuario como membro da empresa. Papel e status nao
 * sao aceitos: o vinculo nasce `member` e `active`. Para varios usuarios de
 * uma vez, usar PUT sync/{companyId}.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'company_id'      => 'required|is_natural_no_zero',
            'user_manager_id' => 'required|is_natural_no_zero',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id'      => ['required' => 'A empresa e obrigatoria'],
            'user_manager_id' => ['required' => 'O usuario e obrigatorio'],
        ];
    }
}
