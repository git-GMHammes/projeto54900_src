<?php

namespace App\Requests\V1\Form\FormCampos;

/**
 * Regras de validacao para PUT /update/{id} (tabela form_fields).
 *
 * Atualizacao parcial: todos os campos permit_empty (inclusive field_type e
 * form_row_id). Se field_type ou os atributos JSON mudarem, o Processor
 * revalida a coerencia e o teto de 12 do grid no hook validateOnUpdate.
 */
class UpdateRequest
{
    private const FIELD_TYPES = 'text,password,email,textarea,senha,select,radio,checkbox,cpf,cnpj,phone,cep,data,hora,moeda,pis,placa,titulo,cnh,processo,renavam,sei';
    private const INPUT_MODES = 'text,numeric,decimal,email,tel,url,search,none';

    public function rules(): array
    {
        return [
            'form_row_id'          => 'permit_empty|is_natural_no_zero',
            'sort_order'           => 'permit_empty|is_natural',
            'field_type'           => 'permit_empty|in_list[' . self::FIELD_TYPES . ']',
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
            'field_type' => [
                'in_list' => 'O campo field_type nao corresponde a um tipo do FormGrid',
            ],
            'col' => [
                'is_natural_no_zero' => 'O campo col deve ser um inteiro de 1 a 12',
                'less_than_equal_to' => 'O campo col deve ser no maximo 12',
            ],
        ];
    }
}
