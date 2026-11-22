<?php

namespace App\Requests\V1\Health\HealthRegistrations;

/**
 * Regras de entrada do PUT /update/{id} da tabela health_registrations.
 *
 * registro em conselho profissional (CRM e outros) de usuario ou empresa. Regras de negocio (vinculos, unicidade, status) ficam no Processor.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'subject_type' => 'permit_empty|in_list[user,company]',
            'user_id' => 'permit_empty|is_natural_no_zero|is_not_unique[user_manager.id]',
            'council' => 'permit_empty|in_list[CRM,CRO,CRN,COREN,CREFITO,CRP,CRF,OTHER]',
            'registration_number' => 'permit_empty|string|max_length[30]',
            'state' => 'permit_empty|string|exact_length[2]',
            'specialty' => 'permit_empty|string|max_length[100]',
            'rqe' => 'permit_empty|string|max_length[30]',
            'valid_until' => 'permit_empty|string|valid_date[Y-m-d]',
            'status' => 'permit_empty|in_list[active,inactive,suspended]',
            'notes' => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
        ];
    }
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:18:40
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122160000_modulo_saude_apis_plano.json
Objetivo: Regras de entrada do update de health_registrations.
Proposito: expor a API V1 do modulo Health (Saude), um submodulo por tabela ou view criada no banco DEV, seguindo o padrao ROADMAP_padrao_modulo (6 camadas, 18 rotas por tabela, 9 por view).
Motivo: pedido do usuario para gerar apenas APIs e backend das 7 tabelas e 8 views health_*.
Ligacoes: company_manager (company_id da sessao), user_manager e user_profiles (medico e paciente), service_order e service_manager (atendimento), health_* (demais submodulos).
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Health\HealthRegistrations\UpdateRequest.php
*/
