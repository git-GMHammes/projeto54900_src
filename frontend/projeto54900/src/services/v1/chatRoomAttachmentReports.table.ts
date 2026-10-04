// PROPOSITO: recurso REST de ESCRITA/LEITURA da tabela chat_room_attachment_reports
// (denúncias de anexo). Espelho de app/Config/Routes/Api/v1/ChatRooms/ChatRoomAttachmentReports/EndpointTable.php,
// grupo api/v1/chat-room-attachment-reports. Tudo é adminonly no backend, exceto create (denunciar).
// A tela de revisão usa só get/{id} e update/{id}; a listagem vem de list_manager (view).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const chatRoomAttachmentReportsTable = createResource(API_GROUPS.chatRoomAttachmentReports, 'v1');

export default chatRoomAttachmentReportsTable;
