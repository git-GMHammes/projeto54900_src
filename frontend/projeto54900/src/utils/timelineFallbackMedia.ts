/**
 * Mídia de fallback da Timeline: quando o anexo de um post não é encontrado (binário
 * indisponível ou imagem/vídeo que falha ao carregar), sorteia 1 item de
 * `config/timelineFallbackMedia.json` — arquivos estáticos de `public/`, que nunca falham.
 * Imagens e GIFs são exibidos como `image` (GIF anima em <img>).
 */

import fallbackList from '@/config/timelineFallbackMedia.json';
import type { MediaAttachment } from '@/components/global/MediaPreview';

export function pickFallbackMedia(): MediaAttachment {
  const item = fallbackList[Math.floor(Math.random() * fallbackList.length)]!;
  return {
    id: `fallback-${item.id}`,
    category: 'image',
    fileUrl: encodeURI(item.caminho), // nomes com ']' exigem encode
    name: item.descricao,
    fallbackLabel: item.descricao,
  };
}
