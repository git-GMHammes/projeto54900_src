<?php

namespace App\Requests\V1\Messages\MessageMentions;

/**
 * Regras de entrada do PUT /api/v1/message-mentions/update/{id}.
 *
 * Troca o usuario marcado (correcao administrativa); a mensagem e imutavel. So admin; o novo marcado
 * segue as mesmas regras do create (membro ativo do grupo, nunca o remetente).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            /*
            CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 15:25:13
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Messages\MessageMentions\UpdateRequest.php
            LINHA ALTERADA - linha 24 neste arquivo editado:
            Era : 'user_manager_id' => 'required|is_natural_no_zero',
            Ficou : 'user_manager_id' => 'permit_empty|is_natural_no_zero',
            Motivo: o vinculo user_manager_id passa a ser opcional (pode ser NULL); quando informado continua validado.
            */
            'user_manager_id' => 'permit_empty|is_natural_no_zero',
        ];
    }

    public function messages(): array
    {
        return [
            'user_manager_id' => ['required' => 'O usuario marcado e obrigatorio'],
        ];
    }
}
