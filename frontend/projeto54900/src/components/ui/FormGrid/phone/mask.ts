/**
 * Mascara de telefone do campo 'phone' do FormGrid, em arquivo proprio para
 * ser compartilhada sem quebrar o fast refresh do componente (index.tsx so
 * exporta componente). CONSUMIDORES: ./index.tsx (PhoneField) e
 * utils/listConstructor.tsx (renderer de celula 'phone').
 */

/**
 * Formata os dígitos puros com máscara progressiva:
 *   10 dígitos → (NN) NNNN-NNNN   (fixo)
 *   11 dígitos → (NN) NNNNN-NNNN  (celular com 9)
 */
export function aplicarMascara(raw: string): string {
  const d = raw.slice(0, 11)
  const len = d.length

  if (len === 0) return ''
  if (len <= 2) return `(${d}`
  if (len <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (len <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  // 11 dígitos: grupo antes do traço tem 5 dígitos (inclui o 9)
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
