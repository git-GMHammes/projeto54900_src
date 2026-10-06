// PROPOSITO: ajustes pontuais no schema do FormGrid montado a partir do banco
// (form_manager), feitos pela PAGINA em tempo de execucao — valor inicial vindo
// do registro/sessao, campo desabilitado por papel e campo controlado.
// Nao conhece nenhum modulo: recebe nomes de campo (field.name) e valores.
//
// Usado por: pages/v1/messages/messages-manager (Create/Update) e
// pages/v1/messages/message-groups-manager (Create/Update).

import type { AnyFieldSchema, FormGridSchema } from '@/components/ui/FormGrid/Input';

/** Propriedades a sobrepor num campo (ex.: `{ disabled: true }`, `{ value, onChange }`). */
export type FieldPatch = Record<string, unknown>;

/** Aplica remendos por `field.name`, sem mexer nos demais campos. */
export function patchFields(schema: FormGridSchema, patches: Record<string, FieldPatch>): FormGridSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((f) => {
        const patch = f.name ? patches[f.name] : undefined;
        return patch ? { ...f, ...patch } : f;
      }),
    })),
  };
}

/**
 * Preenche o valor inicial dos campos cujo `name` esta em `values`.
 * Select recebe `defaultValue` + `values` (selecao inicial); os demais tipos
 * (texto, textarea, data/hora...) recebem `defaultValue`. Valor vazio nao mexe.
 */
export function fillValues(schema: FormGridSchema, values: Record<string, string>): FormGridSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((f) => {
        const value = f.name ? values[f.name] : undefined;
        if (value === undefined || value === '') return f;
        if (f.type === 'select') return { ...f, defaultValue: value, values: [value] };
        // Tipos de lista (checkbox/radio) tem defaultValue proprio: o valor e sempre texto aqui.
        return { ...f, defaultValue: value } as AnyFieldSchema;
      }),
    })),
  };
}
