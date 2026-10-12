<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Registro dos modulos que podem receber vinculo com o mapa (map_links).
 *
 * Chave = slug do modulo (o mesmo usado em map_links.module e no grupo de rota);
 * valor = tabela onde mora o registro vinculado (map_links.reference_id = id).
 *
 * Modulo novo que queira CEP, endereco, ponto ou rota: acrescentar UMA linha
 * aqui. Modulo fora da lista e rejeitado (422) pelo MapLinks\Processor.
 */
class MapLinkables extends BaseConfig
{
    /**
     * @var array<string, string>
     */
    public array $modules = [
        // Usuarios e empresas
        'user-manager'              => 'user_manager',
        'user-profiles'             => 'user_profiles',
        'company-manager'           => 'company_manager',
        'company-members'           => 'company_members',
        // Anexos (o proprio Upload recebe vinculo)
        'upload-manager'            => 'uploads',
        // Agenda
        'calendar-manager'          => 'calendar_manager',
        'calendar-events'           => 'calendar_events',
        'calendar-event-attendees'  => 'calendar_event_attendees',
        'calendar-event-reminders'  => 'calendar_event_reminders',
        'calendar-event-attachments' => 'calendar_event_attachments',
        'calendar-event-invites'    => 'calendar_event_invites',
        // Timeline
        'timeline-manager'          => 'timeline_manager',
        'timeline-posts'            => 'timeline_posts',
        'timeline-post-comments'    => 'timeline_post_comments',
        'timeline-post-attachments' => 'timeline_post_attachments',
        // Salas de chat
        'chat-rooms-manager'        => 'chat_rooms_manager',
        'chat-messages'             => 'chat_messages',
        'chat-room-attachments'     => 'chat_room_attachments',
        // Mensagens diretas e grupos
        'messages-manager'          => 'messages_manager',
        'message-groups-manager'    => 'message_groups_manager',
        'message-group-messages'    => 'message_group_messages',
        'message-attachments'       => 'message_attachments',
    ];
}
