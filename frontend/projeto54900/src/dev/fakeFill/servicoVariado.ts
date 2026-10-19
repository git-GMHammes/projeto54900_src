/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/servicoVariado.ts
 * =========================================================================
 *
 * PROPOSITO: script DEV-ONLY de "Fake fill" do cadastro de servico (slug `criar-servico`, tela
 * /v1/service-manager/create): percorre em rodizio servicos de ramos diferentes (marido de aluguel, passeador de
 * cao, enfermagem domiciliar, alvenaria, ar-condicionado, limpeza pos-obra, montagem de moveis, fisioterapia,
 * pintura e eletricista) e preenche o nucleo do servico (codigo, nome, tipo, prestador biscate/MEI/empresa com
 * CPF ou CNPJ valido, unidade de cobranca, preco, duracao e prazo com unidade de tempo, descricao) e todos os
 * grupos de caracteristicas do AttributeForm (dados em dev/fakeFill/servicoVariadoData.ts).
 *
 * COMO ACHA OS CAMPOS: nucleo pelo id do campo (= field_key do form); caracteristicas pelos ids do AttributeForm
 * (ver dev/fakeFill/atributosFill.ts).
 *
 * DEV-ONLY: quem decide se roda e o FakeFillButton (isDevHost). Ligado em dev/fakeFill/registry.ts.
 * -------------------------------------------------------------------------
 */

import { fillAttributes, setText, sleep } from './atributosFill';
import { randomInt, randomToken, selectComboboxOption } from './domUtils';
import { SERVICE_ITEMS } from './servicoVariadoData';
import type { ServiceItem } from './servicoVariadoData';

/** Campos do catalogo de servico que sao lista de opcoes (select do FormGrid); datas e demais campos entram como texto. */
const SELECT_FIELDS: ReadonlySet<string> = new Set([
  'modalidade',
  'local_execucao',
  'material_incluso',
  'deslocamento_incluso',
  'dia_atendimento',
  'urgencia',
  'forma_pagamento',
  'regime_tributario',
  'emite_nota',
  'seguro',
  'antecedentes',
  'nivel_risco',
  'restricao_uso',
]);

/** Chave do localStorage com o proximo servico (rodizio: cada clique cadastra o seguinte). */
const NEXT_KEY = 'fakeFill.servicoVariado.next';

function nextItem(): ServiceItem {
  let index = 0;
  try {
    index = Number(localStorage.getItem(NEXT_KEY) ?? '0');
    localStorage.setItem(NEXT_KEY, String((index + 1) % SERVICE_ITEMS.length));
  } catch {
    // sem localStorage: sempre o primeiro item
  }
  return SERVICE_ITEMS[Number.isInteger(index) && index >= 0 ? index % SERVICE_ITEMS.length : 0]!;
}

/** Digitos verificadores (modulo 11) a partir dos pesos informados. */
function checkDigit(digits: number[], weights: number[]): number {
  const sum = digits.reduce((acc, d, i) => acc + d * (weights[i] ?? 0), 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/** CPF valido (11 digitos). */
function cpf(): string {
  const base = Array.from({ length: 9 }, () => randomInt(0, 9));
  base.push(checkDigit(base, [10, 9, 8, 7, 6, 5, 4, 3, 2]));
  base.push(checkDigit(base, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]));
  return base.join('');
}

/** CNPJ valido (14 digitos, filial 0001). */
function cnpj(): string {
  const base = [...Array.from({ length: 8 }, () => randomInt(0, 9)), 0, 0, 0, 1];
  base.push(checkDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
  base.push(checkDigit(base, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
  return base.join('');
}

/** Fake fill de /v1/service-manager/create (slug `criar-servico`). */
export async function fillServicoVariadoForm(): Promise<void> {
  const item = nextItem();

  setText('code', `SRV-${randomToken(6).toUpperCase()}`);
  setText('name', item.name);
  setText('type', item.type);
  setText('provider_document', item.provider === 'biscate' ? cpf() : cnpj());
  setText('billing_unit', item.billingUnit);
  setText('price', item.price.toFixed(2));
  setText('currency', 'BRL');
  setText('duration', String(item.duration[0]));
  setText('lead_time', String(item.lead[0]));
  setText('description', item.description);
  await selectComboboxOption('provider_type', item.provider);
  await selectComboboxOption('duration_unit', item.duration[1]);
  await selectComboboxOption('lead_time_unit', item.lead[1]);
  await selectComboboxOption('status', 'active');
  await sleep(80);

  await fillAttributes(item.attrs, SELECT_FIELDS);
}
