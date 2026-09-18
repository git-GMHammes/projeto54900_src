<?php

namespace App\Requests\V1\Calendar\CalendarEventExtendedProperties;

/**
 * Regras de validacao para PUT /update/{id} (tabela calendar_event_extended_properties).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se calendar_event_id,
 * scope ou property_key vierem, a existencia da FK e a unicidade de
 * (calendar_event_id, scope, property_key) sao reavaliadas no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'calendar_event_id' => 'permit_empty|is_natural_no_zero',
            'scope'             => 'permit_empty|in_list[private,shared]',
            'property_key'      => 'permit_empty|string|max_length[255]',
            'property_value'    => 'permit_empty|string|max_length[1024]',
        ];
    }

    public function messages(): array
    {
        return [
            'calendar_event_id' => [
                'is_natural_no_zero' => 'O campo calendar_event_id deve ser um inteiro maior que zero',
            ],
            'scope' => [
                'in_list' => 'O campo scope deve ser private ou shared',
            ],
            'property_key' => [
                'max_length' => 'O campo property_key nao pode exceder 255 caracteres',
            ],
            'property_value' => [
                'max_length' => 'O campo property_value nao pode exceder 1024 caracteres',
            ],
        ];
    }
}
