/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/domUtils.ts
 * =========================================================================
 *
 * PROPOSITO: helpers DEV-ONLY compartilhados por todo script de
 * preenchimento fake (um por formulario, ver dev/fakeFill/registry.ts).
 * Nao chamar em codigo de producao — isso aqui manipula o DOM por fora do
 * React de proposito, so para simular preenchimento humano em teste manual.
 *
 * PROBLEMA QUE `setReactValue` RESOLVE: campo de texto/textarea do FormGrid
 * e sempre renderizado como componente React (controlado ou nao). Fazer
 * `el.value = 'x'` direto nao avisa o React (ele guarda o ultimo valor que
 * ELE proprio escreveu no input e ignora mudanca externa no mesmo valor).
 * A solucao padrao e usar o SETTER NATIVO do prototype (que o React
 * sobrescreve na instancia) e depois disparar 'input' — e exatamente o que
 * aconteceria se o usuario tivesse digitado.
 *
 * PROBLEMA QUE `selectComboboxOption` RESOLVE: o campo tipo 'select' do
 * FormGrid (components/ui/FormGrid/select) NAO e um <select> simples — e um
 * combobox com busca cujo valor real vai para um <input type="hidden">
 * atualizado só quando o <select> NATIVO interno dispara 'change'. Esse
 * <select> só existe no DOM quando o dropdown está aberto (após foco). Por
 * isso a funcao é assíncrona: foca, espera o proximo frame (React re-render
 * monta o dropdown) e só então despacha o 'change' com o valor certo.
 *
 * DEPENDENCIAS: nenhuma (DOM nativo do browser).
 * CONSUMIDORES: dev/fakeFill/calendario.ts e qualquer script de formulario
 * futuro registrado em dev/fakeFill/registry.ts.
 * -------------------------------------------------------------------------
 */

/** Escreve um valor num <input>/<textarea> de um jeito que o React "enxerga" (dispara onChange). */
export function setReactValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
}

/**
 * Seleciona uma opção no combobox custom do FormGrid (components/ui/FormGrid/select),
 * a partir do id do campo de busca (mesmo `id` do schema) e do `value` da opção.
 * Foca o campo (abre o dropdown), espera o próximo frame e dispara 'change' no
 * <select> nativo interno com o value desejado. Retorna false (sem lançar) se o
 * campo ou a opção não forem encontrados — é dev-only, uma falha aqui não pode
 * quebrar a tela.
 */
export async function selectComboboxOption(fieldId: string, value: string): Promise<boolean> {
  const searchInput = document.getElementById(fieldId);
  if (!(searchInput instanceof HTMLInputElement)) return false;

  searchInput.focus();
  await nextFrame();

  const container = searchInput.closest('div');
  const select = container?.querySelector<HTMLSelectElement>('select');
  if (!select) return false;

  const option = Array.from(select.options).find((o) => o.value === value);
  if (!option) return false;

  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

// --- geradores aleatorios simples (sem lib externa — projeto nao usa faker) ---

export function randomItem<T>(items: readonly T[]): T {
  const list = items;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx] as T;
}

export function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Token curto (base36) para sufixos únicos (ex.: evitar 409 em coluna UNIQUE). */
export function randomToken(length = 8): string {
  return Math.random().toString(36).slice(2, 2 + length);
}

export function randomHexColor(): string {
  const hex = randomInt(0, 0xffffff).toString(16).padStart(6, '0');
  return `#${hex}`;
}

/** Frase curta em PT-BR a partir de um banco de palavras — só para preencher campo de texto livre. */
export function randomSentence(words: readonly string[], count = 4): string {
  const picked = Array.from({ length: count }, () => randomItem(words));
  const sentence = picked.join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
