/**
 * =========================================================================
 * FILE HEADER — services/v1/index.ts
 * =========================================================================
 *
 * O QUE FAZ: barrel (arquivo agregador) dos services da v1 — reexporta cada
 * instancia/objeto de service com nome unico, para import unico:
 * `import { userManagerView } from '@/services/v1';` em vez de importar
 * arquivo por arquivo.
 *
 * DEPENDENCIAS: todos os demais arquivos deste diretorio
 * (`*.table.ts`, `*.view.ts`, `auth.service.ts`, `dbSchema.ts`,
 * `uploadManager.upload.ts`) — cada um exportando uma instancia nomeada.
 * CONSUMIDORES: paginas e hooks em toda a v1 (pages/v1/**, hooks/useSiteMenu.ts,
 * context/AuthContext.tsx) importam os services daqui.
 *
 * COMO REGISTRAR UM NOVO SERVICE: criar o arquivo `<recurso>.table.ts` (ou
 * `.view.ts`/`.service.ts` conforme o caso, seguindo os padroes descritos no
 * header de cada arquivo deste diretorio) e adicionar uma linha
 * `export { <nome> } from './<arquivo>';` abaixo, mantendo o agrupamento
 * por modulo (auth, user, upload, form, list, nav, menu, meta).
 * -------------------------------------------------------------------------
 */

export { authService } from './auth.service';
export { userManagerTable } from './userManager.table';
export { userManagerView } from './userManager.view';
export { userProfilesTable, userProfilesMe } from './userProfiles.table';
export { userRolesTable } from './userRoles.table';
export { uploadManagerTable } from './uploadManager.table';
export { uploadManagerView } from './uploadManager.view';
export { uploadManagerUpload } from './uploadManager.upload';
export { formManagerTable } from './formManager.table';
export { formManagerView } from './formManager.view';
export { formGroupsTable } from './formGroups.table';
export { formRowsTable } from './formRows.table';
export { formCamposTable } from './formCampos.table';
export { listManagerTable } from './listManager.table';
export { listColumnsTable } from './listColumns.table';
export { listActionsTable } from './listActions.table';
export { navManagerTable } from './navManager.table';
export { menuManagerTable } from './menuManager.table';
export { calendarManagerTable } from './calendarManager.table';
export { calendarManagerView } from './calendarManager.view';
export { calendarEventAttendeesTable, respondToEvent } from './calendarEventAttendees.table';
export { calendarEventInvitesTable } from './calendarEventInvites.table';
export { calendarEventRemindersTable } from './calendarEventReminders.table';
export { calendarEventAttachmentsTable } from './calendarEventAttachments.table';
export { timelinePostsTable, getHomeFeed, getFeedPost } from './timelinePosts.table';
export { timelinePostCommentsTable } from './timelinePostComments.table';
export { timelinePostCommentsView } from './timelinePostComments.view';
export { timelinePostReactionsTable } from './timelinePostReactions.table';
export { timelinePostRatingsTable } from './timelinePostRatings.table';
export { timelinePostAttachmentsTable } from './timelinePostAttachments.table';
export { timelinePostAttachmentsUpload } from './timelinePostAttachments.upload';
export { chatRoomsManagerTable } from './chatRoomsManager.table';
export { chatRoomsManagerView } from './chatRoomsManager.view';
export { chatMessagesTable } from './chatMessages.table';
export { chatMessagesView } from './chatMessages.view';
export { chatRoomMembersTable } from './chatRoomMembers.table';
export { chatRoomMembersView } from './chatRoomMembers.view';
export { chatRoomAttachmentsTable } from './chatRoomAttachments.table';
export { chatRoomAttachmentsView } from './chatRoomAttachments.view';
export { chatRoomAttachmentReportsTable } from './chatRoomAttachmentReports.table';
export { chatRoomWarningsTable } from './chatRoomWarnings.table';
export { chatRoomFavoritesTable } from './chatRoomFavorites.table';
export { chatRoomAttachmentsUpload } from './chatRoomAttachments.upload';
export { messagesManagerTable } from './messagesManager.table';
export { messagesManagerView } from './messagesManager.view';
export { messagesUsersView } from './messagesUsers.view';
export { messageGroupsManagerTable } from './messageGroupsManager.table';
export { messageGroupsManagerView } from './messageGroupsManager.view';
export { messageGroupMembersTable, syncMessageGroupMembers } from './messageGroupMembers.table';
export type { MessageGroupSyncResult } from './messageGroupMembers.table';
export { messageGroupMembersView } from './messageGroupMembers.view';
export { messageUsersGroupsView } from './messageUsersGroups.view';
export { messageGroupMembershipsView } from './messageGroupMemberships.view';
export { messageGroupMessagesTable } from './messageGroupMessages.table';
export { messageGroupMessagesView } from './messageGroupMessages.view';
export { messageAttachmentsTable } from './messageAttachments.table';
export { messageAttachmentsView } from './messageAttachments.view';
export { messageAttachmentsUpload } from './messageAttachments.upload';
export { messageContactsView } from './messageContacts.view';
export { messageWarningsTable } from './messageWarnings.table';
export { messageWarningsView } from './messageWarnings.view';
export { messageGroupReadsTable } from './messageGroupReads.table';
export { messageGroupReadsView } from './messageGroupReads.view';
export { messageGroupChatView } from './messageGroupChat.view';
export type { MessageAttachmentUploadArgs } from './messageAttachments.upload';
export { dbSchema } from './dbSchema';
