<?php

namespace App\Requests\V1\Sgd\Documents;

/**
 * Regras de validacao para PUT /update/{id} (tabela sgd_documents).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'document_type' => 'permit_empty|string|max_length[50]',
            'document_number' => 'permit_empty|string|max_length[50]',
            'document_date' => 'permit_empty|valid_date[Y-m-d]',
            'process_number' => 'permit_empty|string|max_length[50]',
            'registration_number' => 'permit_empty|string|max_length[30]',
            'sender_name' => 'permit_empty|string|max_length[255]',
            'recipient_name' => 'permit_empty|string|max_length[255]',
            'time' => 'permit_empty|regex_match[/^\d{2}:\d{2}(:\d{2})?$/]',
            'time_end' => 'permit_empty|regex_match[/^\d{2}:\d{2}(:\d{2})?$/]',
            'place' => 'permit_empty|string|max_length[255]',
            'agenda' => 'permit_empty|string',
            /*
            CODE/REVIEW - Gustavo Hammes - 21-11-2026 - 22:59:04
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Sgd\Documents\UpdateRequest.php
            BLOCO ADICIONADO - 12 linhas (44 a 55 neste arquivo editado):
            'cnpj' => 'permit_empty|string',
            'article' => 'permit_empty|string',
            'protocol_date' => 'permit_empty|valid_date[Y-m-d]',
            'contract_number' => 'permit_empty|string|max_length[255]',
            'term_end' => 'permit_empty|valid_date[Y-m-d]',
            'global_amount' => 'permit_empty|decimal',
            'contract_inspector' => 'permit_empty|string|max_length[255]',
            'reserve_note' => 'permit_empty|string|max_length[255]',
            'law_number' => 'permit_empty|string|max_length[255]',
            'decree_number' => 'permit_empty|string|max_length[255]',
            'e_signer_name' => 'permit_empty|string|max_length[255]',
            'website' => 'permit_empty|string|max_length[255]',
            Antes de : 'agenda' => 'permit_empty|string',
            Depois de : 'subject' => 'permit_empty|string|max_length[255]',
            Motivo: Validar as colunas novas do Despacho conforme o tipo da coluna em sgd_documents (cnpj e article guardam valores repetidos, um por linha).
            */
            'cnpj' => 'permit_empty|string',
            'article' => 'permit_empty|string',
            'protocol_date' => 'permit_empty|valid_date[Y-m-d]',
            'contract_number' => 'permit_empty|string|max_length[255]',
            'term_end' => 'permit_empty|valid_date[Y-m-d]',
            'global_amount' => 'permit_empty|decimal',
            'contract_inspector' => 'permit_empty|string|max_length[255]',
            'reserve_note' => 'permit_empty|string|max_length[255]',
            'law_number' => 'permit_empty|string|max_length[255]',
            'decree_number' => 'permit_empty|string|max_length[255]',
            'e_signer_name' => 'permit_empty|string|max_length[255]',
            'website' => 'permit_empty|string|max_length[255]',
            'subject' => 'permit_empty|string|max_length[255]',
            'body' => 'permit_empty|string',
            /*
            CODE/REVIEW - Gustavo Hammes - 21-11-2026 - 22:59:05
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Sgd\Documents\UpdateRequest.php
            LINHA ALTERADA - linha 66 neste arquivo editado:
            Era : 'parenthetical_note' => 'permit_empty|string|max_length[255]',
            Ficou : 'parenthetical_note' => 'permit_empty|string',
            Motivo: A coluna parenthetical_note passou a TEXT para guardar as ocorrencias repetidas, uma por linha.
            */
            'parenthetical_note' => 'permit_empty|string',
            'signature_name' => 'permit_empty|string|max_length[150]',
            'signature_position' => 'permit_empty|string|max_length[150]',
            'email' => 'permit_empty|valid_email|max_length[150]',
            'phone' => 'permit_empty|string|max_length[20]',
            'zip_code' => 'permit_empty|string|max_length[9]',
        ];
    }

    public function messages(): array
    {
        return [];
    }
}
