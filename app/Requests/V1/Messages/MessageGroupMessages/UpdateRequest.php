<?php

namespace App\Requests\V1\Messages\MessageGroupMessages;

/**
 * Regras de entrada do PUT /api/v1/message-group-messages/update/{id}.
 *
 * {id} e o id da ligacao (message_group_messages). Altera so o texto, a data de envio ou
 * remove (`status=removed`), em qualquer status (area administrativa irrestrita); o grupo e
 * imutavel (o mesmo valor e ignorado, outro e 403).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'message_groups_manager_id' => 'permit_empty|is_natural_no_zero',
            'content'                   => 'permit_empty|string',
            'scheduled_at'              => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'status'                    => 'permit_empty|in_list[removed]',
        ];
    }

    public function messages(): array
    {
        return [
            'scheduled_at' => ['valid_date' => 'A data de envio e invalida'],
            'status'       => ['in_list' => 'O status so pode ser alterado para removed'],
        ];
    }
}
