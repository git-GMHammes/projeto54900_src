<?php

namespace App\Requests\V1\Health\HealthRecords;

/**
 * Regras de entrada do PUT /update/{id} da tabela health_records.
 *
 * prontuario do atendimento (queixa, anamnese, diagnostico, CID-10, conduta). Regras de negocio (vinculos, unicidade, status) ficam no Processor.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'patient_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_patients.id]',
            'professional_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_registrations.id]',
            'service_order_id' => 'permit_empty|is_natural_no_zero|is_not_unique[service_order.id]',
            'complaint' => 'permit_empty|string',
            'anamnesis' => 'permit_empty|string',
            'diagnosis' => 'permit_empty|string',
            'cid10' => 'permit_empty|string|max_length[10]',
            'conduct' => 'permit_empty|string',
            'notes' => 'permit_empty|string',
            'status' => 'permit_empty|in_list[draft,signed,cancelled]',
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'professional_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
            'service_order_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
        ];
    }
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:18:40
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122160000_modulo_saude_apis_plano.json
Objetivo: Regras de entrada do update de health_records.
Proposito: expor a API V1 do modulo Health (Saude), um submodulo por tabela ou view criada no banco DEV, seguindo o padrao ROADMAP_padrao_modulo (6 camadas, 18 rotas por tabela, 9 por view).
Motivo: pedido do usuario para gerar apenas APIs e backend das 7 tabelas e 8 views health_*.
Ligacoes: company_manager (company_id da sessao), user_manager e user_profiles (medico e paciente), service_order e service_manager (atendimento), health_* (demais submodulos).
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Health\HealthRecords\UpdateRequest.php
*/
