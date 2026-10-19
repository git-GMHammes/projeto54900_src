/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/atributosFill.ts
 * =========================================================================
 *
 * PROPOSITO: motor DEV-ONLY compartilhado pelos scripts de "Fake fill" dos cadastros com caracteristicas por catalogo
 * (produto e servico): escreve no AttributeForm campo a campo. Os controles do AttributeForm tem ids estaveis —
 * `attr-<grupo>-<campo>` (valor), `...-unit` (unidade) e, nos campos que repetem, `attr-<grupo>-<campo>-new`,
 * `-new-unit`, `-new-label` + o botao `[data-attr-add="grupo.campo"]`.
 *
 * ATENCAO ao ritmo: o AttributeForm guarda as linhas em estado React; duas escritas no mesmo tick partiriam do
 * mesmo estado antigo e a segunda apagaria a primeira. Por isso cada escrita espera um intervalo curto.
 *
 * CONSUMIDORES: dev/fakeFill/produtoCirurgico.ts e dev/fakeFill/servicoVariado.ts.
 * -------------------------------------------------------------------------
 */

import { selectComboboxOption, setReactValue } from './domUtils';

/** [grupo, campo, valor, extras]. `multi` = campo que repete (usa a linha "Adicionar"). */
export type Attr = readonly [group: string, field: string, value: string, extra?: { unit?: string; label?: string; multi?: boolean }];

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Escreve num input/textarea pelo id, de um jeito que o React enxerga. */
export function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) setReactValue(el, value);
}

/** Escolhe a opcao do select; se o id ou o valor nao existirem no catalogo, avisa no console (dev-only). */
export async function selectOrWarn(id: string, value: string): Promise<void> {
  if (!(await selectComboboxOption(id, value))) console.warn('[fakeFill] opcao nao encontrada:', id, value);
}

/** Preenche UMA caracteristica; `selectFields` = codigos dos campos do catalogo que sao lista de opcoes. */
export async function fillAttribute([group, field, value, extra]: Attr, selectFields: ReadonlySet<string>): Promise<void> {
  const base = `attr-${group}-${field}`;
  const isSelect = selectFields.has(field);

  if (extra?.multi) {
    const id = `${base}-new`;
    if (extra.label) setText(`${id}-label`, extra.label);
    if (isSelect) await selectOrWarn(id, value);
    else setText(id, value);
    if (extra.unit) setText(`${id}-unit`, extra.unit);
    await sleep(40);
    document.querySelector<HTMLButtonElement>(`button[data-attr-add="${group}.${field}"]`)?.click();
    await sleep(60);
    return;
  }

  if (isSelect) await selectOrWarn(base, value);
  else setText(base, value);
  if (extra?.unit) setText(`${base}-unit`, extra.unit);
  await sleep(40);
}

/** Preenche a lista toda, em ordem. */
export async function fillAttributes(attrs: readonly Attr[], selectFields: ReadonlySet<string>): Promise<void> {
  for (const attr of attrs) {
    await fillAttribute(attr, selectFields);
  }
}
