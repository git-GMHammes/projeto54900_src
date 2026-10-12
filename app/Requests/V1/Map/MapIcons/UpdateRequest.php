<?php

namespace App\Requests\V1\Map\MapIcons;

/**
 * Regras de entrada do PUT /api/v1/map-icons/update/{id}.
 *
 * Tabela map_icons — icones de marcacao geografica (Bootstrap Icon, imagem ou SVG).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'name'       => 'permit_empty|string|max_length[150]',
            'icon_type'  => 'permit_empty|in_list[bootstrap-icon,image,svg]',
            'icon_class' => 'permit_empty|string|max_length[100]',
            'upload_id'  => 'permit_empty|is_natural',
            'color'      => 'permit_empty|string|max_length[20]',
            'size_w'     => 'permit_empty|is_natural|less_than_equal_to[32767]',
            'size_h'     => 'permit_empty|is_natural|less_than_equal_to[32767]',
            'anchor_x'   => 'permit_empty|is_natural|less_than_equal_to[32767]',
            'anchor_y'   => 'permit_empty|is_natural|less_than_equal_to[32767]',
            'status'     => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'icon_type' => [
                'in_list' => 'Valor invalido: use bootstrap-icon, image, svg',
            ],
            'status' => [
                'in_list' => 'Valor invalido: use active, inactive',
            ],
        ];
    }
}
