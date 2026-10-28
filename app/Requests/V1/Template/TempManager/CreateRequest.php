<?php

namespace App\Requests\V1\Template\TempManager;

/**
 * Regras de validacao para POST /create (tabela temp_manager).
 *
 * code (minusculo, letras e numeros) e name sao obrigatorios; o code e unico (409 no Processor)
 * e imutavel depois de criado. company_manager (lista de slugs, pode ser vazia) e validado no
 * Processor: slugs existentes e nenhum slug em dois templates ativos. status nao entra no
 * create (nasce draft; ativar e um update).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'code'            => 'required|regex_match[/^[a-z0-9]+$/]|max_length[30]',
            'name'            => 'required|string|max_length[100]',
            'description'     => 'permit_empty|string|max_length[255]',
            'company_manager' => 'permit_empty',
        ];
    }
}
