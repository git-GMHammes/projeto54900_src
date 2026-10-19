/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/produtoCirurgico.ts
 * =========================================================================
 *
 * PROPOSITO: script DEV-ONLY de "Fake fill" do cadastro de produto (slug `criar-produto`, tela
 * /v1/product-manager/create) com MATERIAL PARA CIRURGIAS: percorre em rodizio os itens do kit (fio de sutura, pinca de Kelly,
 * bisturi, campos, compressas, luvas, avental, mascara, seringa, agulha, cateter, tesoura, porta-agulha, antisseptico...) e preenche o nucleo do produto e todos os
 * grupos de caracteristicas do AttributeForm (identificacao, classificacao, composicao, estetica, fisica,
 * tecnica, seguranca, regulatorio, armazenagem, embalagem, comercial).
 *
 * COMO ACHA OS CAMPOS: nucleo pelo id do campo (= field_key do form: code, name, type...); caracteristicas
 * pelos ids que o AttributeForm define — `attr-<grupo>-<campo>` (valor), `...-unit` (unidade) e, nos campos que
 * repetem, `attr-<grupo>-<campo>-new`, `-new-unit`, `-new-label` + o botao `[data-attr-add="grupo.campo"]`.
 *
 * ATENCAO ao ritmo: o AttributeForm guarda as linhas em estado React; duas escritas no mesmo tick partiriam do
 * mesmo estado antigo e a segunda apagaria a primeira. Por isso cada escrita espera um intervalo curto.
 *
 * DEV-ONLY: quem decide se roda e o FakeFillButton (isDevHost). Ligado em dev/fakeFill/registry.ts.
 * -------------------------------------------------------------------------
 */

import { fillAttributes, setText, sleep } from './atributosFill';
import { randomInt, randomToken, selectComboboxOption } from './domUtils';
import { SURGICAL_ITEMS } from './produtoCirurgicoData';
import type { SurgicalItem } from './produtoCirurgicoData';

/** Campos do catalogo de produto que sao lista de opcoes (select do FormGrid); datas e demais campos entram como texto. */
const SELECT_FIELDS: ReadonlySet<string> = new Set(['natureza', 'estado_materia', 'perigoso', 'restricao_uso', 'rastreio', 'fragil', 'empilhavel']);

/** GTIN-13 valido (digito verificador calculado), prefixo 789 (Brasil). */
function gtin13(): string {
  const base = '789' + String(randomInt(0, 999_999_999)).padStart(9, '0');
  const sum = [...base].reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
  return base + String((10 - (sum % 10)) % 10);
}

/** Chave do localStorage com o proximo item do kit (rodizio: cada clique cadastra o item seguinte). */
const NEXT_KEY = 'fakeFill.produtoCirurgico.next';

/** Proximo item do kit cirurgico em rodizio (cliques seguidos percorrem a lista toda; sem storage, o primeiro). */
function nextItem(): SurgicalItem {
  let index = 0;
  try {
    index = Number(localStorage.getItem(NEXT_KEY) ?? '0');
    localStorage.setItem(NEXT_KEY, String((index + 1) % SURGICAL_ITEMS.length));
  } catch {
    // sem localStorage: sempre o primeiro item
  }
  return SURGICAL_ITEMS[Number.isInteger(index) && index >= 0 ? index % SURGICAL_ITEMS.length : 0]!;
}

/** Fake fill de /v1/product-manager/create (slug `criar-produto`): material para cirurgias. */
export async function fillProdutoCirurgicoForm(): Promise<void> {
  const item = nextItem();

  setText('code', `CIR-${randomToken(6).toUpperCase()}`);
  setText('name', item.name);
  setText('type', 'material_cirurgico');
  setText('stock_min', String(item.stock[0]));
  setText('stock_max', String(item.stock[1]));
  setText('description', item.description);
  await selectComboboxOption('status', 'active');
  await sleep(60);

  setText('attr-identificacao-gtin', gtin13());
  await sleep(40);
  const cost = item.price[0];
  setText('attr-comercial-preco_custo', cost.toFixed(2));
  await sleep(40);
  setText('attr-comercial-preco_venda', (cost * 1.6).toFixed(2));
  await sleep(40);

  await fillAttributes(item.attrs, SELECT_FIELDS);
}
