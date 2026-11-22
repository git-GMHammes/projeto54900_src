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
            /*
            CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 15:25:13
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Company\CompanyMembers\CreateRequest.php
            LINHA ALTERADA - linha 26 neste arquivo editado:
            Era : 'user_manager_id' => 'required|is_natural_no_zero',
            Ficou : 'user_manager_id' => 'permit_empty|is_natural_no_zero',
            Motivo: o vinculo user_manager_id passa a ser opcional (pode ser NULL); quando informado continua validado.
            */
            'user_manager_id' => 'permit_empty|is_natural_no_zero',
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
