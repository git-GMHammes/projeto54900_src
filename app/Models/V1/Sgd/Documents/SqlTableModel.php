<?php

namespace App\Models\V1\Sgd\Documents;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela sgd_documents — campos identificados no escaneamento de um documento do SGD.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'sgd_documents';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'document_type',
        'document_number',
        'document_date',
        'process_number',
        'registration_number',
        'sender_name',
        'recipient_name',
        'time',
        'time_end',
        'place',
        'agenda',
        /*
        CODE/REVIEW - Gustavo Hammes - 21-11-2026 - 22:59:04
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Models\V1\Sgd\Documents\SqlTableModel.php
        BLOCO ADICIONADO - 12 linhas (55 a 66 neste arquivo editado):
        'cnpj',
        'article',
        'protocol_date',
        'contract_number',
        'term_end',
        'global_amount',
        'contract_inspector',
        'reserve_note',
        'law_number',
        'decree_number',
        'e_signer_name',
        'website',
        Antes de : 'agenda',
        Depois de : 'subject',
        Motivo: Permitir gravar as colunas novas do Despacho em sgd_documents.
        */
        'cnpj',
        'article',
        'protocol_date',
        'contract_number',
        'term_end',
        'global_amount',
        'contract_inspector',
        'reserve_note',
        'law_number',
        'decree_number',
        'e_signer_name',
        'website',
        'subject',
        'body',
        'parenthetical_note',
        'signature_name',
        'signature_position',
        'email',
        'phone',
        'zip_code',
        'status',
    ];

    protected array $likeFields = ['document_type', 'document_number', 'subject', 'signature_name'];

    protected array $sortableFields = [
        'id',
        'document_type',
        'document_number',
        'document_date',
        'process_number',
        'registration_number',
        'sender_name',
        'recipient_name',
        'time',
        'time_end',
        'place',
        'agenda',
        /*
        CODE/REVIEW - Gustavo Hammes - 21-11-2026 - 22:59:04
        Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Models\V1\Sgd\Documents\SqlTableModel.php
        BLOCO ADICIONADO - 12 linhas (113 a 124 neste arquivo editado):
        'cnpj',
        'article',
        'protocol_date',
        'contract_number',
        'term_end',
        'global_amount',
        'contract_inspector',
        'reserve_note',
        'law_number',
        'decree_number',
        'e_signer_name',
        'website',
        Antes de : 'agenda',
        Depois de : 'subject',
        Motivo: Permitir ordenar pelas colunas novas do Despacho em sgd_documents.
        */
        'cnpj',
        'article',
        'protocol_date',
        'contract_number',
        'term_end',
        'global_amount',
        'contract_inspector',
        'reserve_note',
        'law_number',
        'decree_number',
        'e_signer_name',
        'website',
        'subject',
        'body',
        'parenthetical_note',
        'signature_name',
        'signature_position',
        'email',
        'phone',
        'zip_code',
        'status',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['document_type', 'document_number', 'subject', 'signature_name'];
}
