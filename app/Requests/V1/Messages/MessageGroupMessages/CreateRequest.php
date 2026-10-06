<?php

namespace App\Requests\V1\Messages\MessageGroupMessages;

/**
 * Regras de entrada do POST /api/v1/message-group-messages/create.
 *
 * Envia uma mensagem a um grupo: cria a mensagem (messages_manager, sem destinatario
 * individual) e a ligacao com o grupo numa transacao. O remetente e sempre o usuario da
 * sessao. `scheduled_at` futuro agenda; vazio envia agora.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'message_groups_manager_id' => 'required|is_natural_no_zero',
            'content'                   => 'required|string',
            'scheduled_at'              => 'permit_empty|valid_date[Y-m-d H:i:s]',
        ];
    }

    public function messages(): array
    {
        return [
            'message_groups_manager_id' => ['required' => 'O grupo e obrigatorio'],
            'content'                   => ['required' => 'A mensagem e obrigatoria'],
            'scheduled_at'              => ['valid_date' => 'A data de envio e invalida'],
        ];
    }
}
