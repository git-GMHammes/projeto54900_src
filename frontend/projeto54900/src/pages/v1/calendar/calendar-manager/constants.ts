// Slugs dos registros persistidos que dirigem esta tela — nada de coluna/ação
// fixa no código (ver README_list_constructor.md e calendar_manager_editar.md).
import { env } from '@/config/env';

export const CALENDAR_FORM_SLUG = 'calendario'; // form_manager: criar calendário (POST)
export const EDIT_FORM_SLUG = 'editar-calendario'; // form_manager: editar calendário (PUT)
export const EVENT_FORM_SLUG = 'cadastro-evento'; // form_manager: criar evento (POST)
export const ATTENDEE_FORM_SLUG = 'cadastro-convidado'; // form_manager: convidar para o evento (POST calendar-event-attendees)
export const REMINDER_FORM_SLUG = 'cadastro-lembrete'; // form_manager: lembrete do evento (POST calendar-event-reminders)
export const ATTACHMENT_FORM_SLUG = 'cadastro-anexo-evento'; // form_manager: anexo do evento (POST calendar-event-attachments)
// `uploads.module` dos anexos — espelho de CalendarEventAttachments\Processor::UPLOAD_MODULE
// (arquivo em writable/uploads/calendar_events/<evento>/).
export const ATTACHMENT_UPLOAD_MODULE = 'calendar_events';
// Extensões aceitas no seletor — espelho de app/Config/Upload.php ($allowedExt); o backend revalida.
export const ATTACHMENT_ACCEPT = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tif', 'tiff',
  'mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac',
  'mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v',
  'doc', 'docx', 'odt', 'rtf', 'txt', 'md',
  'xls', 'xlsx', 'ods', 'csv',
  'ppt', 'pptx', 'odp',
  'pdf',
  'zip', 'rar', '7z', 'tar', 'gz',
].map((ext) => `.${ext}`).join(',');
export const ACTIONS_LIST_SLUG = 'calendar-manager'; // list_manager: ações da linha (list_actions)
export const EVENTS_LIST_SLUG = 'calendar-events-view'; // list_manager: colunas do modal "Ver eventos"
export const PAGE_SIZE = 10;
// Usuários de sistema (user_manager, status 'blocked' — não logam) usados como
// dono padrão do calendário quando a sessão JWT não identifica o usuário:
// sem token -> 'guest'; com token mas sem usuário resolvido -> 'unknown'.
export const GUEST_USERNAME = 'guest';
export const UNKNOWN_USERNAME = 'unknown';
// Select de agenda abaixo da lista: carga inicial paginada (limit 1000) e, ao
// digitar, POST find por summary (LIKE no backend) — alcança agendas fora das 1000.
export const CALENDAR_SELECT_SRC = `${env.apiBaseUrl}/v1/calendar-manager/get-all?page=1&limit=1000&sort=summary&order=ASC`;
export const CALENDAR_FIND_SRC = `${env.apiBaseUrl}/v1/calendar-manager/find?limit=50`;
