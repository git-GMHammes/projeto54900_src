<?php

namespace App\Requests\V1\Form\FormCampos;

/**
 * Regras de validacao para POST /create (tabela form_campos).
 *
 * Reproduz os atributos de qualquer componente do FormGrid. DDL de referencia:
 *   form_row_id  BIGINT NOT NULL  FK -> form_rows.id
 *   sort_order   INT DEFAULT 0
 *   field_type   ENUM(text,password,email,textarea,senha,select,radio,checkbox,
 *                     cpf,cnpj,phone,cep,data,hora,moeda,pis,placa,titulo,cnh,
 *                     processo,renavam,sei) DEFAULT 'text'
 *   col          TINYINT DEFAULT 12   (1..12)
 *   label,field_name,field_key,placeholder,help_text  VARCHAR(255) NULL
 *   default_value TEXT NULL
 *   required,disabled,read_only,is_hidden  TINYINT(1) DEFAULT 0
 *   max_length,min_length  INT NULL
 *   pattern      VARCHAR(255) NULL
 *   input_mode   VARCHAR(20)  NULL (text|numeric|decimal|email|tel|url|search|none)
 *   autocomplete VARCHAR(64)  NULL
 *   no_numbers,no_letters,no_special_chars,strong_password,double_field,
 *   equal_fields,with_seconds,inline  TINYINT(1) DEFAULT 0
 *   show_counter TINYINT(1) NULL
 *   rows_qty     INT NULL
 *   min_date,max_date  VARCHAR(10) NULL (ISO Y-m-d)
 *   options_json,datalist_json,allowed_domains_json,select_config_json,
 *   style_json,attributes_json  JSON NULL
 *
 * Existencia de form_row_id e coerencia tipo x atributos sao verificadas no
 * hook validateOnCreate / prepareData do Processor.
 */
class CreateRequest
{
    private const FIELD_TYPES = 'text,password,email,textarea,senha,select,radio,checkbox,cpf,cnpj,phone,cep,data,hora,moeda,pis,placa,titulo,cnh,processo,renavam,sei';
    private const INPUT_MODES = 'text,numeric,decimal,email,tel,url,search,none';

    public function rules(): array
    {
        return [
            'form_row_id'          => 'required|is_natural_no_zero',
            'sort_order'           => 'permit_empty|is_natural',
            'field_type'           => 'required|in_list[' . self::FIELD_TYPES . ']',
            'col'                  => 'permit_empty|is_natural_no_zero|less_than_equal_to[12]',
            'label'                => 'permit_empty|string|max_length[255]',
            'field_name'           => 'permit_empty|string|max_length[255]',
            'field_key'            => 'permit_empty|string|max_length[255]',
            'placeholder'          => 'permit_empty|string|max_length[255]',
            'default_value'        => 'permit_empty|string',
            'help_text'            => 'permit_empty|string|max_length[255]',
            'required'             => 'permit_empty|in_list[0,1]',
            'disabled'             => 'permit_empty|in_list[0,1]',
            'read_only'            => 'permit_empty|in_list[0,1]',
            'is_hidden'            => 'permit_empty|in_list[0,1]',
            'max_length'           => 'permit_empty|is_natural',
            'min_length'           => 'permit_empty|is_natural',
            'pattern'              => 'permit_empty|string|max_length[255]',
            'input_mode'           => 'permit_empty|in_list[' . self::INPUT_MODES . ']',
            'autocomplete'         => 'permit_empty|string|max_length[64]',
            'no_numbers'           => 'permit_empty|in_list[0,1]',
            'no_letters'           => 'permit_empty|in_list[0,1]',
            'no_special_chars'     => 'permit_empty|in_list[0,1]',
            'strong_password'      => 'permit_empty|in_list[0,1]',
            'double_field'         => 'permit_empty|in_list[0,1]',
            'equal_fields'         => 'permit_empty|in_list[0,1]',
            'with_seconds'         => 'permit_empty|in_list[0,1]',
            'show_counter'         => 'permit_empty|in_list[0,1]',
            'inline'               => 'permit_empty|in_list[0,1]',
            'rows_qty'             => 'permit_empty|is_natural',
            'min_date'             => 'permit_empty|valid_date[Y-m-d]',
            'max_date'             => 'permit_empty|valid_date[Y-m-d]',
            'options_json'         => 'permit_empty',
            'datalist_json'        => 'permit_empty',
            'allowed_domains_json' => 'permit_empty',
            'select_config_json'   => 'permit_empty',
            'style_json'           => 'permit_empty',
            'attributes_json'      => 'permit_empty',
        ];
    }

    public function messages(): array
    {
        return [
            'form_row_id' => [
                'required'           => 'O campo form_row_id e obrigatorio',
                'is_natural_no_zero' => 'O campo form_row_id deve ser um inteiro maior que zero',
            ],
            'field_type' => [
                'required' => 'O campo field_type e obrigatorio',
                'in_list'  => 'O campo field_type nao corresponde a um tipo do FormGrid',
            ],
            'col' => [
                'is_natural_no_zero'   => 'O campo col deve ser um inteiro de 1 a 12',
                'less_than_equal_to'   => 'O campo col deve ser no maximo 12',
            ],
        ];
    }
}
