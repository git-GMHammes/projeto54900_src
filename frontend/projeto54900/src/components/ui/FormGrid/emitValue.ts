/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/emitValue.ts
 * =========================================================================
 *
 * PROPOSITO: helper compartilhado por todos os componentes de campo com
 * mascara. Cada campo mascarado exibe um texto formatado no `<input>`
 * (ex.: "123.456.789-00") mas precisa entregar ao `onChange` do consumidor
 * o valor "cru" (ex.: "12345678900") — emitValue() reconstroi o evento
 * original trocando so `target.value`/`currentTarget.value`, preservando
 * todo o resto (tipo do evento, bubbling, etc.), para que o consumidor use
 * o mesmo `ChangeEventHandler<HTMLInputElement>` de sempre.
 *
 * DEPENDENCIAS: nenhuma (so tipos de react).
 * CONSUMIDORES: todos os componentes de campo com mascara — CpfField,
 * CnpjField, CepField, PhoneField, MoedaField, DataField, HoraField,
 * PisField, PlacaField, TituloField, CnhField, ProcessoField,
 * RenavamField, SeiField (campos sem mascara, como EmailField/
 * TextareaField/SenhaField/RadioField/CheckboxField/SelectField, repassam
 * `field.onChange`/`field.onBlur` direto, sem passar por aqui).
 *
 * COMO REAPROVEITAR NUM CAMPO MASCARADO NOVO: no handleChange do campo,
 * calcular o valor cru (`next`) a partir de `e.target.value` e chamar
 * `emitValue(e, next, field.onChange)` em vez de `field.onChange?.(e)`
 * direto.
 * -------------------------------------------------------------------------
 */

import type { ChangeEvent, ChangeEventHandler } from 'react'

/**
 * Reemite um `ChangeEvent` de input trocando `target.value` (e `currentTarget.value`)
 * pelo valor limpo do campo mascarado — o restante do evento é preservado.
 *
 * Usado por todos os campos com máscara (CPF, CNPJ, CEP, telefone, moeda, data,
 * hora, PIS, placa, título, CNH, processo, RENAVAM, SEI): o consumidor lê o valor
 * cru em `e.target.value`, enquanto o input exibe o texto formatado.
 */
export function emitValue(
  e: ChangeEvent<HTMLInputElement>,
  value: string,
  handler: ChangeEventHandler<HTMLInputElement> | undefined,
): void {
  if (!handler) return
  const target = Object.assign({}, e.target, { value })
  const currentTarget = Object.assign({}, e.currentTarget, { value })
  handler({ ...e, target, currentTarget })
}
