// Validacoes simples de formulario. Retornam string de erro ou '' quando ok.

import { toText } from '@/utils/format';

export type Validator = (value: unknown) => string;
export type ValidationSchema<K extends string = string> = Record<K, Validator[]>;

export function required(value: unknown, label = 'Campo'): string {
  const empty = value === null || value === undefined || toText(value, '').trim() === '';
  return empty ? `${label} e obrigatorio.` : '';
}

export function minLength(value: unknown, min: number, label = 'Campo'): string {
  return toText(value, '').trim().length < min
    ? `${label} deve ter ao menos ${min} caracteres.`
    : '';
}

export function maxLength(value: unknown, max: number, label = 'Campo'): string {
  return toText(value, '').length > max
    ? `${label} deve ter no maximo ${max} caracteres.`
    : '';
}

export function isEmail(value: unknown, label = 'E-mail'): string {
  if (!value) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toText(value, '')) ? '' : `${label} invalido.`;
}

// Roda um mapa { campo: [validador, ...] } e devolve { campo: 'erro' } (so os com erro).
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
