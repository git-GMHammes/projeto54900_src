<?php

namespace App\Requests\V1\Messages\MessageWarnings;

/**
 * Regras de entrada do POST /api/v1/message-warnings/create (so admin).
 *
 * A advertencia nasce do sistema (filtro de palavrao); este create e o registro manual administrativo.
 * O grupo vem da propria mensagem (nao e enviado).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'messages_manager_id' => 'required|is_natural_no_zero',
            /*
            CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 15:25:13
            Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Requests\V1\Messages\MessageWarnings\CreateRequest.php
            LINHA ALTERADA - linha 25 neste arquivo editado:
            Era : 'user_manager_id'     => 'required|is_natural_no_zero',
            Ficou : 'user_manager_id'     => 'permit_empty|is_natural_no_zero',
            Motivo: o vinculo user_manager_id passa a ser opcional (pode ser NULL); quando informado continua validado.
            */
            'user_manager_id'     => 'permit_empty|is_natural_no_zero',
            'flagged_word'        => 'required|string|max_length[150]',
        ];
    }

    public function messages(): array
    {
        return [
            'messages_manager_id' => ['required' => 'A mensagem e obrigatoria'],
            'user_manager_id'     => ['required' => 'O autor e obrigatorio'],
            'flagged_word'        => ['required' => 'A palavra marcada e obrigatoria', 'max_length' => 'A palavra deve ter no maximo 150 caracteres'],
        ];
    }
}
