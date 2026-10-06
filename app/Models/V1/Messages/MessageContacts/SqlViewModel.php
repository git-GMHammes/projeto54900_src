<?php

namespace App\Models\V1\Messages\MessageContacts;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_message_contacts — um usuario por linha, com nome, usuario, celular
 * (`uc_phone`) e `phone_digits` (so os digitos, para a busca aceitar o telefone com ou sem
 * mascara). Sem CPF, CEP nem endereco. Somente leitura; o escopo (ativos, sem o proprio
 * usuario) e do Processor. Alimenta a lista de conversas do modo chat.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_message_contacts';
    protected $primaryKey = 'id';

    protected array $likeFields = ['um_username', 'uc_name', 'uc_phone', 'phone_digits'];

    protected array $sortableFields = [
        'id', 'um_username', 'um_status', 'uc_name', 'uc_phone', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['uc_name', 'um_username', 'uc_phone'];

    public array $filterFields = ['um_status'];
}
