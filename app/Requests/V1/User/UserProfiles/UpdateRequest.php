<?php

namespace App\Requests\V1\User\UserProfiles;

/**
 * Regras de validação para PUT /update/{id} (tabela user_profiles).
 *
 * user_manager_id é mutável (permite realocar o perfil para outro
 * user_manager), mas continua obrigatório e validado como FK existente —
 * não faz sentido um perfil sem vínculo.
 *
 * cpf, cep, phone e whatsapp aceitam a máscara na entrada — o Processor
 * remove a máscara (removeMasks) antes de persistir.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'user_manager_id' => 'permit_empty|is_natural_no_zero|is_not_unique[user_manager.id]',
            'uuid'            => 'permit_empty|string|max_length[50]',
            'name'            => 'permit_empty|string|max_length[255]',
            'phone'           => 'permit_empty|string|max_length[20]',
            'whatsapp'        => 'permit_empty|string|max_length[20]',
            'email'           => 'permit_empty|valid_email|max_length[255]',
            'cpf'             => 'permit_empty|string|max_length[14]',
            'cep'             => 'permit_empty|string|max_length[9]',
            'address'         => 'permit_empty|string|max_length[255]',
        ];
    }

    public function messages(): array
    {
        return [
            'user_manager_id' => [
                'is_natural_no_zero' => 'O campo user_manager_id deve ser o id de um user_manager válido',
                'is_not_unique'      => 'O campo user_manager_id não corresponde a um user_manager existente',
            ],
            'uuid' => [
                'max_length' => 'O campo uuid não pode exceder 50 caracteres',
            ],
            'name' => [
                'max_length' => 'O campo name não pode exceder 255 caracteres',
            ],
            'phone' => [
                'max_length' => 'O campo phone não pode exceder 20 caracteres',
            ],
            'whatsapp' => [
                'max_length' => 'O campo whatsapp não pode exceder 20 caracteres',
            ],
            'email' => [
                'valid_email' => 'O campo email deve conter um e-mail válido',
                'max_length'  => 'O campo email não pode exceder 255 caracteres',
            ],
            'cpf' => [
                'max_length' => 'O campo cpf não pode exceder 14 caracteres',
            ],
            'cep' => [
                'max_length' => 'O campo cep não pode exceder 9 caracteres',
            ],
            'address' => [
                'max_length' => 'O campo address não pode exceder 255 caracteres',
            ],
        ];
    }
}
