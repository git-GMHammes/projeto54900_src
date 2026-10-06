<?php

namespace App\Requests\V1\Messages\MessagesManager;

/**
 * Regras de entrada do PUT /api/v1/messages-manager/update/{id}.
 *
 * O formulario envia todas as colunas e o Processor so considera o que mudou:
 *  - remetente, destinatario, `sent_at`, `read_at` e status (exceto remover):
 *    so admin altera (403 para os demais);
 *  - `status=removed`: remetente ou admin cancela a agendada / remove a enviada;
 *  - `content` / `scheduled_at`: remetente so enquanto `scheduled` (409 depois
 *    de enviada); admin a qualquer momento.
 * Nenhuma mudanca = 200 sem alterar nada. Corpo sem nenhum campo = 422.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'sender_user_manager_id'    => 'permit_empty|is_natural_no_zero',
            'recipient_user_manager_id' => 'permit_empty|is_natural_no_zero',
            'content'                   => 'permit_empty|string',
            'status'                    => 'permit_empty|in_list[scheduled,sent,blocked,removed]',
            'scheduled_at'              => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'sent_at'                   => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'read_at'                   => 'permit_empty|valid_date[Y-m-d H:i:s]',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => [
                'in_list' => 'Status invalido: use scheduled, sent, blocked ou removed',
            ],
            'scheduled_at' => [
                'valid_date' => 'Data de envio invalida: use AAAA-MM-DD HH:MM:SS',
            ],
            'sent_at' => [
                'valid_date' => 'Data de envio efetivo invalida: use AAAA-MM-DD HH:MM:SS',
            ],
            'read_at' => [
                'valid_date' => 'Data de leitura invalida: use AAAA-MM-DD HH:MM:SS',
            ],
        ];
    }
}
