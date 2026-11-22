<?php

namespace App\Requests\V1\Messages\MessageMentions;

/**
 * Regras de entrada do POST /api/v1/message-mentions/create.
 *
 * Marca um usuario (@) numa mensagem de GRUPO: `messages_manager_id` (a mensagem) e `user_manager_id` (o
 * marcado, membro ativo do grupo da mensagem e diferente do remetente). So o remetente da mensagem ou o admin
 * marca. Idempotente. No modo chat as marcacoes nascem junto da mensagem (`mentions[]` no create da mensagem).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'messages_manager_id' => 'required|is_natural_no_zero',
            /*
            CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 15:25:13
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Messages\MessageMentions\CreateRequest.php
            LINHA ALTERADA - linha 26 neste arquivo editado:
            Era : 'user_manager_id'     => 'required|is_natural_no_zero',
            Ficou : 'user_manager_id'     => 'permit_empty|is_natural_no_zero',
            Motivo: o vinculo user_manager_id passa a ser opcional (pode ser NULL); quando informado continua validado.
            */
            'user_manager_id'     => 'permit_empty|is_natural_no_zero',
        ];
    }

    public function messages(): array
    {
        return [
            'messages_manager_id' => ['required' => 'A mensagem e obrigatoria'],
            'user_manager_id'     => ['required' => 'O usuario marcado e obrigatorio'],
        ];
    }
}
