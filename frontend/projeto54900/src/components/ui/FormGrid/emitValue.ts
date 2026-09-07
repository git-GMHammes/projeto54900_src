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
