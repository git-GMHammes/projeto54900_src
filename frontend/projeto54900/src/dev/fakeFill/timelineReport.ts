/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/timelineReport.ts
 * =========================================================================
 *
 * PROPOSITO: preenche com dados fake o formulario `timeline-report` — no
 * modal "Denunciar publicação" (pages/v1/timeline/home-feed/NewReportModal.tsx)
 * e no form genérico `/v1/form/timeline-report`. DEV-ONLY — acionado por
 * components/global/FakeFillButton.tsx, que só aparece com isDevHost().
 *
 * IDs USADOS (confirmados em form_fields 230/231, fm_slug 'timeline-report'):
 *   opt_spam ... opt_other   radio "Motivo" (obrigatório) — ids das options_json
 *   fc_report_description    textarea "Detalhes" (opcional) — 1 a 2 frases
 *                            coerentes com o motivo sorteado
 *
 * NÃO toca em "Publicação" (`timeline_post_id`): no NewReportModal ele nem
 * existe (o post vem do card); no form genérico a escolha fica com quem testa.
 *
 * DEPENDENCIAS: dev/fakeFill/domUtils (clickIfUnchecked, setReactValue,
 *   randomInt, randomItem).
 * CONSUMIDORES: dev/fakeFill/registry.ts (entrada 'timeline-report').
 * -------------------------------------------------------------------------
 */

import { clickIfUnchecked, randomInt, randomItem, setReactValue } from './domUtils';

const DESCRIPTION_ID = 'fc_report_description';

/** Id do radio (options_json) -> frases de "Detalhes" que combinam com o motivo. */
const DETALHES_POR_MOTIVO: Record<string, readonly string[]> = {
  opt_spam: [
    'Mesmo conteúdo publicado várias vezes seguidas.',
    'Parece propaganda sem relação com o time.',
    'Link suspeito repetido em várias publicações.',
  ],
  opt_abuse: [
    'Tom agressivo com um colega.',
    'Comentário ofensivo direcionado a uma pessoa.',
    'Linguagem desrespeitosa no texto.',
  ],
  opt_violence: [
    'A imagem mostra cena de violência.',
    'O texto incentiva agressão.',
  ],
  opt_nudity: [
    'Imagem inadequada para o ambiente de trabalho.',
    'Conteúdo com nudez no anexo.',
  ],
  opt_hate: [
    'Texto com discriminação contra um grupo.',
    'Piada preconceituosa na legenda.',
  ],
  opt_copyright: [
    'Imagem copiada de um site sem crédito.',
    'Material interno de outro setor divulgado sem autorização.',
  ],
  opt_misinformation: [
    'A data informada está errada e pode confundir o time.',
    'Informação sobre o processo não confere com o comunicado oficial.',
  ],
  opt_other: [
    'Publicação fora do tema da timeline.',
    'Conteúdo pessoal que deveria estar em mensagem privada.',
    'Peço que a moderação avalie.',
  ],
};

const MOTIVOS = Object.keys(DETALHES_POR_MOTIVO);

/** 1 a 2 frases distintas do motivo. */
function randomDetails(motivoId: string): string {
  const pool = [...(DETALHES_POR_MOTIVO[motivoId] ?? [])];
  const count = randomInt(1, 2);
  const picked: string[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    picked.push(...pool.splice(randomInt(0, pool.length - 1), 1));
  }
  return picked.join(' ');
}

/** Marca um "Motivo*" aleatório e preenche "Detalhes" coerente com ele. */
export function fillTimelineReportForm(): void {
  const motivoId = randomItem(MOTIVOS);
  clickIfUnchecked(motivoId);

  const description = document.getElementById(DESCRIPTION_ID);
  if (description instanceof HTMLTextAreaElement) setReactValue(description, randomDetails(motivoId));
}

export default fillTimelineReportForm;
