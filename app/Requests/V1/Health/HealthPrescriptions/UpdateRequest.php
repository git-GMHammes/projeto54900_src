<?php

namespace App\Requests\V1\Health\HealthPrescriptions;

/**
 * Regras de entrada do PUT /update/{id} da tabela health_prescriptions.
 *
 * receita e medicamento de um prontuario. Regras de negocio (vinculos, unicidade, status) ficam no Processor.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'record_id' => 'permit_empty|is_natural_no_zero|is_not_unique[health_records.id]',
            'medication' => 'permit_empty|string|max_length[200]',
            'dosage' => 'permit_empty|string|max_length[100]',
            'frequency' => 'permit_empty|string|max_length[100]',
            'duration' => 'permit_empty|string|max_length[100]',
            'instructions' => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'record_id' => [
                'is_not_unique' => 'Registro relacionado nao encontrado',
            ],
        ];
    }
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:18:40
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122160000_modulo_saude_apis_plano.json
Objetivo: Regras de entrada do update de health_prescriptions.
Proposito: expor a API V1 do modulo Health (Saude), um submodulo por tabela ou view criada no banco DEV, seguindo o padrao ROADMAP_padrao_modulo (6 camadas, 18 rotas por tabela, 9 por view).
Motivo: pedido do usuario para gerar apenas APIs e backend das 7 tabelas e 8 views health_*.
Ligacoes: company_manager (company_id da sessao), user_manager e user_profiles (medico e paciente), service_order e service_manager (atendimento), health_* (demais submodulos).
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Health\HealthPrescriptions\UpdateRequest.php
*/
