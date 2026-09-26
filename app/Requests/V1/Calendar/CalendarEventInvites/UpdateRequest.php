<?php

namespace App\Requests\V1\Calendar\CalendarEventInvites;

/**
 * Regras de validacao para PUT /update/{id} (tabela calendar_event_invites).
 *
 * Sem caso de uso pratico hoje (nenhuma tela edita um convite existente; o
 * fluxo normal e create -> accept-token). O arquivo existe para cumprir o
 * contrato padrao de modulo (ROADMAP_padrao_modulo.md). token_hash/used_at
 * nunca sao mutaveis por aqui.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'calendar_event_id' => 'permit_empty|is_natural_no_zero',
            'user_manager_id'   => 'permit_empty|is_natural_no_zero',
            'expires_at'        => 'permit_empty|string|valid_date[Y-m-d H:i:s]',
        ];
    }

    public function messages(): array
    {
        return [
            'calendar_event_id' => [
                'is_natural_no_zero' => 'O campo calendar_event_id deve ser um inteiro maior que zero',
            ],
            'user_manager_id' => [
                'is_natural_no_zero' => 'O campo user_manager_id deve ser um inteiro maior que zero',
            ],
            'expires_at' => [
                'valid_date' => 'O campo expires_at deve estar no formato Y-m-d H:i:s',
            ],
        ];
    }
}
