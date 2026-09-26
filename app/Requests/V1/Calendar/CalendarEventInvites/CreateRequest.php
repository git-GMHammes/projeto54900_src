<?php

namespace App\Requests\V1\Calendar\CalendarEventInvites;

/**
 * Regras de validacao para POST /create (tabela calendar_event_invites).
 *
 * DDL de referencia:
 *   calendar_event_id BIGINT NULL FK -> calendar_events.id (NOT NULL na tabela)
 *   user_manager_id   BIGINT NULL FK -> user_manager.id (Modo A: convidado ja
 *                                     pre-cadastrado, escolhido pelo organizador)
 *   email             VARCHAR(255) NULL no payload (NOT NULL na tabela; o
 *                                     Processor sempre preenche: do perfil no
 *                                     Modo A, ou do valor cru abaixo no Modo B)
 *   created_by        BIGINT NULL     sempre preenchido pelo Processor com
 *                                     CurrentUser::id() (organizador)
 *   token_hash        VARCHAR(64) NOT NULL UNIQUE  gerado pelo Processor
 *   expires_at        DATETIME    NOT NULL         gerado pelo Processor (+72h)
 *   used_at           DATETIME    NULL             nunca vem do payload
 *
 * Exatamente um dos dois e exigido pelo cliente:
 *   Modo A: { calendar_event_id, user_manager_id } — convidado ja cadastrado.
 *   Modo B: { calendar_event_id, email }           — convidado sem conta;
 *           accept-token cria a conta automaticamente (ver Processor::acceptToken).
 * Essa exigencia "um dos dois" e de negocio, verificada no hook
 * validateOnCreate do Processor (nao da pra expressar como regra de forma
 * simples do CI4) — aqui as duas regras ficam permit_empty.
 *
 * token_hash/expires_at/used_at/created_by nunca vem do cliente. Existencia
 * de calendar_event_id/user_manager_id (FK ativa) e unicidade (usuario ou
 * e-mail ja convidado/attendee do evento) sao verificadas no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'calendar_event_id' => 'required|is_natural_no_zero',
            'user_manager_id'   => 'permit_empty|is_natural_no_zero',
            'email'             => 'permit_empty|valid_email|max_length[255]',
        ];
    }

    public function messages(): array
    {
        return [
            'calendar_event_id' => [
                'required'           => 'O campo calendar_event_id e obrigatorio',
                'is_natural_no_zero' => 'O campo calendar_event_id deve ser um inteiro maior que zero',
            ],
            'user_manager_id' => [
                'is_natural_no_zero' => 'O campo user_manager_id deve ser um inteiro maior que zero',
            ],
            'email' => [
                'valid_email' => 'O campo email deve ser um endereco valido',
                'max_length'  => 'O campo email nao pode exceder 255 caracteres',
            ],
        ];
    }
}
