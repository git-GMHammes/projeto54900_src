<?php

namespace App\Requests\V1\Calendar\CalendarEventExtendedProperties;

/**
 * Regras de validacao para POST /create (tabela calendar_event_extended_properties).
 *
 * DDL de referencia:
 *   calendar_event_id BIGINT        NOT NULL  FK -> calendar_events.id
 *   scope             ENUM(private,shared) DEFAULT 'private'
 *   property_key      VARCHAR(255)  NOT NULL
 *   property_value    VARCHAR(1024) NOT NULL
 *
 * Existencia de calendar_event_id (FK ativa) e unicidade de
 * (calendar_event_id, scope, property_key) sao verificadas no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'calendar_event_id' => 'required|is_natural_no_zero',
            'scope'             => 'permit_empty|in_list[private,shared]',
            'property_key'      => 'required|string|max_length[255]',
            'property_value'    => 'required|string|max_length[1024]',
        ];
    }

    public function messages(): array
    {
        return [
            'calendar_event_id' => [
                'required'           => 'O campo calendar_event_id e obrigatorio',
                'is_natural_no_zero' => 'O campo calendar_event_id deve ser um inteiro maior que zero',
            ],
            'scope' => [
                'in_list' => 'O campo scope deve ser private ou shared',
            ],
            'property_key' => [
                'required'   => 'O campo property_key e obrigatorio',
                'max_length' => 'O campo property_key nao pode exceder 255 caracteres',
            ],
            'property_value' => [
                'required'   => 'O campo property_value e obrigatorio',
                'max_length' => 'O campo property_value nao pode exceder 1024 caracteres',
            ],
        ];
    }
}
