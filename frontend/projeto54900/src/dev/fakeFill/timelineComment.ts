/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/timelineComment.ts
 * =========================================================================
 *
 * PROPOSITO: preenche com dados fake o formulario `timeline-comment` — no
 * modal "Novo comentário" (pages/v1/timeline/home-feed/NewCommentModal.tsx)
 * e no form genérico `/v1/form/timeline-comment`. DEV-ONLY — acionado por
 * components/global/FakeFillButton.tsx, que só aparece com isDevHost().
 *
 * IDs USADOS (field_key, confirmados em view_form_manager, fm_slug
 * 'timeline-comment'):
 *   fc_comment_content  textarea (obrigatório) — 1 a 2 frases curtas
 *
 * NÃO toca em "Publicação" (`timeline_post_id`) nem "Responder a"
 * (`parent_id`): no NewCommentModal eles nem existem (o post vem do card);
 * no form genérico a escolha do post fica com quem está testando.
 *
 * DEPENDENCIAS: dev/fakeFill/domUtils (setReactValue, randomInt).
 * CONSUMIDORES: dev/fakeFill/registry.ts (entrada 'timeline-comment').
 * -------------------------------------------------------------------------
 */

import { randomInt, setReactValue } from './domUtils';

const CONTENT_ID = 'fc_comment_content';

// Frases curtas de comentário "de rede social".
const FRASES = [
  'Muito bom, parabéns pelo trabalho!',
  'Excelente iniciativa, conte comigo.',
  'Ótimo resultado, equipe.',
  'Obrigado por compartilhar.',
  'Concordo totalmente.',
  'Faltou só a data da próxima reunião.',
  'Que venham as próximas etapas!',
  'Registro importante, vou repassar para o time.',
  'Show! Podemos conversar sobre isso amanhã?',
  'Ficou claro e bem organizado.',
];

/** 1 a 2 frases distintas. */
function randomComment(): string {
  const pool = [...FRASES];
  const count = randomInt(1, 2);
  const picked: string[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    picked.push(...pool.splice(randomInt(0, pool.length - 1), 1));
  }
  return picked.join(' ');
}

/** Preenche o campo "Comentário*" com um texto curto. */
export function fillTimelineCommentForm(): void {
  const content = document.getElementById(CONTENT_ID);
  if (content instanceof HTMLTextAreaElement) setReactValue(content, randomComment());
}

export default fillTimelineCommentForm;
