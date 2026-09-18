/**
 * =========================================================================
 * FILE HEADER — utils/validation.ts
 * =========================================================================
 *
 * PROPOSITO: validacoes simples de formulario, no padrao "validator puro":
 * cada funcao recebe o valor e devolve string de erro (ou '' quando ok),
 * para compor um ValidationSchema rodado de uma vez por runValidators().
 *
 * DEPENDENCIAS: utils/format (toText, normaliza o valor para string antes
 * de medir tamanho/testar vazio).
 * CONSUMIDORES: nenhum ate o momento — busca no projeto nao encontrou
 * nenhuma pagina/componente importando este arquivo. Os formularios atuais
 * validam via `required`/`checkValidity()` nativo do HTML (ver
 * RegisterPage.tsx, FormRendererPage.tsx). Mantido disponivel para quando
 * uma validacao client-side mais rica (min/max/e-mail) for necessaria alem
 * da validacao nativa do <form>.
 *
 * COMO REAPROVEITAR: montar um ValidationSchema ({ campo: [validador1,
 * validador2] }) e chamar runValidators(valores, schema) — o primeiro
 * validador que retornar mensagem nao-vazia "vence" para aquele campo.
 * -------------------------------------------------------------------------
 */

import { toText } from '@/utils/format';

export type Validator = (value: unknown) => string;
export type ValidationSchema<K extends string = string> = Record<K, Validator[]>;

/** Erro se o valor for null/undefined/string vazia (apos trim). @param label nome do campo usado na mensagem */
export function required(value: unknown, label = 'Campo'): string {
  const empty = value === null || value === undefined || toText(value, '').trim() === '';
  return empty ? `${label} e obrigatorio.` : '';
}

/** Erro se o valor (trimado) tiver menos que `min` caracteres. */
export function minLength(value: unknown, min: number, label = 'Campo'): string {
  return toText(value, '').trim().length < min
    ? `${label} deve ter ao menos ${min} caracteres.`
    : '';
}

/** Erro se o valor tiver mais que `max` caracteres (sem trim). */
export function maxLength(value: unknown, max: number, label = 'Campo'): string {
  return toText(value, '').length > max
    ? `${label} deve ter no maximo ${max} caracteres.`
    : '';
}

/** Erro se o valor nao casar com um formato basico de e-mail; vazio e considerado valido (combinar com required se for obrigatorio). */
export function isEmail(value: unknown, label = 'E-mail'): string {
  if (!value) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toText(value, '')) ? '' : `${label} invalido.`;
}

/**
 * Roda um ValidationSchema completo ({ campo: [validador, ...] }) contra um
 * objeto de valores e devolve so os campos com erro ({ campo: 'mensagem' }).
 * Para cada campo, para no primeiro validador que retornar mensagem
 * nao-vazia (nao acumula varios erros do mesmo campo).
 * @param values valores atuais do formulario (parcial: campo pode estar ausente)
 * @param schema mapa campo -> lista de validadores, na ordem em que devem rodar
 */
export function runValidators<K extends string>(
  values: Partial<Record<K, unknown>>,
  schema: ValidationSchema<K>,
): Partial<Record<K, string>> {
  const errors: Partial<Record<K, string>> = {};
  for (const key of Object.keys(schema) as K[]) {
    for (const validator of schema[key]) {
      const msg = validator(values[key]);
      if (msg) {
        errors[key] = msg;
        break;
      }
    }
  }
  return errors;
}
