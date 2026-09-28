/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/timelinePost.ts
 * =========================================================================
 *
 * PROPOSITO: preenche com dados fake o formulario `timeline-post` (modal
 * "Nova publicação" de pages/v1/timeline/home-feed/NewPostModal.tsx):
 * texto de tamanho médio no campo "Publicação*" + UM arquivo sorteado entre
 * doc/clipart_teste/img001..img005.jpg e video_001..video_011.mp4 (desde
 * 2026-09-28; antes só imagem) no campo "Anexo". DEV-ONLY — acionado
 * por components/global/FakeFillButton.tsx, que só aparece com isDevHost().
 *
 * IDs USADOS (field_key, confirmados em view_form_manager, fm_slug
 * 'timeline-post' — form enxuto desde 2026-09-28):
 *   fc_post_content  textarea (obrigatório)
 *   fc_post_file     arquivo  (components/ui/FormGrid/arquivo, 1 arquivo)
 *
 * DE ONDE VEM A IMAGEM: o navegador não lê disco local — a pasta
 * doc/clipart_teste (fora da raiz do Vite) é servida pelo dev-server via
 * `/@fs/<caminho absoluto>`, liberada em `server.fs.allow` do vite.config.ts,
 * que também injeta o caminho em `__DEV_CLIPART_DIR__` (só no `npm run dev`).
 * O script baixa (fetch), monta um `File` e coloca no <input type="file">
 * via `DataTransfer` + evento 'change' (é o que o React escuta num input de
 * arquivo) — o ArquivoField mostra nome/tamanho como se o usuário tivesse
 * escolhido.
 *
 * FORA DO DEV: `__DEV_CLIPART_DIR__` vira '' no build — nenhuma imagem de
 * teste é referenciada nem copiada para o dist/ (NÃO trocar por
 * `import`/`import.meta.glob`: o Vite emite o asset mesmo em ramo morto,
 * conferido em 2026-09-28). Lá o script preenche só o texto.
 *
 * REGRAS DE NEGOCIO RESPEITADAS: `content` obrigatório (sempre preenchido);
 * 1 anexo por publicação (1 arquivo só); jpg e mp4 são extensão/MIME aceitos
 * pelo Config\Upload do backend (categorias image/video); todos os arquivos
 * de teste ficam abaixo do teto de upload de 20 MB (MAX_UPLOAD_MB).
 *
 * DEPENDENCIAS: dev/fakeFill/domUtils (setReactValue, randomItem, randomInt).
 * CONSUMIDORES: dev/fakeFill/registry.ts (entrada 'timeline-post').
 * -------------------------------------------------------------------------
 */

import { randomInt, randomItem, setReactValue } from './domUtils';

const CONTENT_ID = 'fc_post_content';
const FILE_ID = 'fc_post_file';

/**
 * Arquivos de teste em doc/clipart_teste (sorteio entre TODOS — imagem ou vídeo,
 * desde 2026-09-28). Todos abaixo do teto de 20 MB (maior: video_004.mp4, ~19,9 MB).
 */
const CLIPART_FILES = [
  'img001.jpg', 'img002.jpg', 'img003.jpg', 'img004.jpg', 'img005.jpg',
  'video_001.mp4', 'video_002.mp4', 'video_003.mp4', 'video_004.mp4', 'video_005.mp4', 'video_006.mp4',
  'video_007.mp4', 'video_008.mp4', 'video_009.mp4', 'video_010.mp4', 'video_011.mp4',
] as const;

/** MIME pela extensão (o blob do dev-server pode vir sem type). */
function mimeFor(name: string): string {
  return name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
}

/** URL do dev-server para um arquivo de doc/clipart_teste ('' fora do `npm run dev`). */
function clipartUrl(name: string): string {
  return __DEV_CLIPART_DIR__ ? `${import.meta.env.BASE_URL}@fs/${__DEV_CLIPART_DIR__}/${name}` : '';
}

// Frases prontas para montar um texto "de rede social" de tamanho médio.
const FRASES = [
  'Hoje fechamos mais uma etapa importante do projeto com a equipe.',
  'Obrigado a todos que participaram da reunião de alinhamento desta semana.',
  'Compartilho algumas fotos do evento de ontem, foi um dia muito produtivo.',
  'Aprendi bastante com o treinamento sobre boas práticas de atendimento.',
  'Seguimos firmes no planejamento do próximo trimestre.',
  'Parabéns ao time de suporte pela dedicação nos últimos dias.',
  'Registro aqui o resultado do mutirão de organização do setor.',
  'Fica o convite para a próxima apresentação, todos são bem-vindos.',
  'Pequenos ajustes no processo já trouxeram um ganho visível de tempo.',
  'Deixem nos comentários sugestões para as próximas melhorias.',
];

/** 2 a 4 frases distintas, na ordem sorteada (~150-400 caracteres). */
function randomPost(): string {
  const pool = [...FRASES];
  const count = randomInt(2, 4);
  const picked: string[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = randomInt(0, pool.length - 1);
    picked.push(...pool.splice(idx, 1));
  }
  return picked.join(' ');
}

/** Baixa uma imagem/vídeo sorteado e coloca no input de arquivo. false se indisponível (build/pasta ausente). */
async function attachRandomMedia(): Promise<boolean> {
  const input = document.getElementById(FILE_ID);
  const name = randomItem(CLIPART_FILES);
  const url = clipartUrl(name);
  if (!(input instanceof HTMLInputElement) || url === '') return false;

  const response = await fetch(url);
  if (!response.ok) return false;
  const blob = await response.blob();
  const file = new File([blob], name, { type: blob.type || mimeFor(name) });

  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

/** Preenche "Publicação*" com texto médio e "Anexo" com uma imagem ou vídeo de teste aleatório. */
export async function fillTimelinePostForm(): Promise<void> {
  const content = document.getElementById(CONTENT_ID);
  if (content instanceof HTMLTextAreaElement) setReactValue(content, randomPost());

  await attachRandomMedia();
}

export default fillTimelinePostForm;
