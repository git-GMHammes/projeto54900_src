// Categorias de anexo aceitas pelo MediaPreview (espelho de chat_room_attachments.category).

import type { MediaCategory } from '@/components/global/MediaPreview';

export const MEDIA_CATEGORIES: readonly MediaCategory[] = [
  'image', 'video', 'audio', 'document', 'spreadsheet', 'presentation', 'pdf', 'archive', 'other',
];

/** Converte a categoria vinda da API; desconhecida vira 'other'. */
export function toMediaCategory(value: unknown): MediaCategory {
  const text = typeof value === 'string' ? value : '';
  return (MEDIA_CATEGORIES as readonly string[]).includes(text) ? (text as MediaCategory) : 'other';
}


const CATEGORY_BY_EXTENSION: Record<string, MediaCategory> = {
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', bmp: 'image', svg: 'image',
  mp4: 'video', webm: 'video', mov: 'video', avi: 'video', mkv: 'video',
  mp3: 'audio', wav: 'audio', ogg: 'audio', m4a: 'audio',
  pdf: 'pdf',
  xls: 'spreadsheet', xlsx: 'spreadsheet', csv: 'spreadsheet', ods: 'spreadsheet',
  ppt: 'presentation', pptx: 'presentation', odp: 'presentation',
  doc: 'document', docx: 'document', odt: 'document', txt: 'document', rtf: 'document',
  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
};

/** Categoria pela extensão do nome do arquivo (quando a view não traz a categoria). */
export function categoryFromName(name: string): MediaCategory {
  const dot = name.lastIndexOf('.');
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
  return CATEGORY_BY_EXTENSION[ext] ?? 'other';
}
