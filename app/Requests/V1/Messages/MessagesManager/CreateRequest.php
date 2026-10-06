<?php

namespace App\Requests\V1\Messages\MessagesManager;

/**
 * Regras de entrada do POST /api/v1/messages-manager/create.
 *
 * O formulario envia quase todas as colunas. Regras de negocio no Processor:
 *  - `sender_user_manager_id`: so admin pode enviar em nome de outro usuario
 *    (vazio ou igual a sessao = usuario logado; outro valor sem ser admin = 403);
 *  - `status`: `blocked`/`removed` sao respeitados; `scheduled`/`sent` sao
 *    resolvidos pela data (`scheduled_at` futuro = `scheduled`, senao `sent`);
 *    `scheduled` sem data = 422;
 *  - `sent_at` vazio = agora (se `sent`); `read_at` vazio = nao lida;
 *  - destinatario inexistente/inativo, auto-envio e `scheduled_at` no passado
 *    sao recusados (data passada so para admin registrando mensagem ja enviada).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'sender_user_manager_id'    => 'permit_empty|is_natural_no_zero',
            'recipient_user_manager_id' => 'required|is_natural_no_zero',
            'content'                   => 'required|string',
            'status'                    => 'permit_empty|in_list[scheduled,sent,blocked,removed]',
            'scheduled_at'              => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'sent_at'                   => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'read_at'                   => 'permit_empty|valid_date[Y-m-d H:i:s]',
        ];
    }

    public function messages(): array
    {
        return [
            'recipient_user_manager_id' => [
                'required'           => 'Informe o destinatario da mensagem',
                'is_natural_no_zero' => 'Destinatario invalido',
            ],
            'sender_user_manager_id' => [
                'is_natural_no_zero' => 'Remetente invalido',
            ],
            'content' => [
                'required' => 'A mensagem nao pode ficar vazia',
            ],
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
