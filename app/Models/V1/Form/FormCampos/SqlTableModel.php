<?php

namespace App\Models\V1\Form\FormCampos;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela form_fields.
 *
 * Tabela: form_fields (FK form_row_id -> form_rows, CASCADE).
 * Reproduz os atributos de qualquer componente do FormGrid: colunas explicitas
 * para o essencial, flags TINYINT(1) por tipo e colunas JSON para arrays /
 * cauda longa (options_json, datalist_json, allowed_domains_json,
 * select_config_json, style_json, attributes_json).
 *
 * field_type: text|password|email|textarea|senha|select|radio|checkbox|cpf|
 *             cnpj|phone|cep|data|hora|moeda|pis|placa|titulo|cnh|processo|
 *             renavam|sei
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'form_fields';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'form_row_id',
        'sort_order',
        'field_type',
        'col',
        'label',
        'field_name',
        'field_key',
        'placeholder',
        'default_value',
        'help_text',
        'required',
        'disabled',
        'read_only',
        'is_hidden',
        'max_length',
        'min_length',
        'pattern',
        'input_mode',
        'autocomplete',
        'no_numbers',
        'no_letters',
        'no_special_chars',
        'strong_password',
        'double_field',
        'equal_fields',
        'with_seconds',
        'show_counter',
        'inline',
        'rows_qty',
        'min_date',
        'max_date',
        'options_json',
        'datalist_json',
        'allowed_domains_json',
        'select_config_json',
        'style_json',
        'attributes_json',
    ];

    protected array $likeFields = [
        'label',
        'field_name',
        'field_key',
        'placeholder',
        'help_text',
    ];

    protected array $sortableFields = [
        'id',
        'form_row_id',
        'sort_order',
        'field_type',
        'col',
        'label',
        'field_name',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'label',
        'field_name',
        'field_key',
        'placeholder',
        'help_text',
        'default_value',
    ];
}
