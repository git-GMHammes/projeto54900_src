// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_message_contacts.
// Espelho de app/Config/Routes/Api/v1/Messages/MessageContacts/EndPointView.php, grupo
// api/v1/message-contacts-view -> Api\V1\Messages\MessageContacts\ResourceViewController.
// Usuarios ativos, SEM o proprio usuario logado (escopo no backend), com nome, usuario e celular. O
// `search` aceita nome, usuario e telefone com ou sem mascara. Alimenta a lista de conversas do modo chat.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageContactsView = createResource(API_GROUPS.messageContactsView, 'v1', { mutations: false });

export default messageContactsView;
