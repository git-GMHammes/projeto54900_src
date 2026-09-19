/**
 * =========================================================================
 * FILE HEADER — components/ui/FormGrid/FieldTooltip/index.tsx
 * =========================================================================
 *
 * PROPOSITO: ícone de ajuda ("ⓘ") que revela um tooltip customizado — fonte
 * maior que o `title` nativo do HTML, que não aceita CSS (tamanho fixo do
 * SO/navegador). É o padrão do FormGrid para exibir `fc_help_text`
 * (services/formSchema.ts -> field.title): faz parte da fábrica de campos,
 * não do app hospedeiro — por isso mora aqui (não em styles/_custom.scss).
 *
 * POR QUE UM ÍCONE PRÓPRIO (E NÃO hover no campo inteiro): a primeira versão
 * mostrava o tooltip ao passar o mouse em QUALQUER parte do campo — num
 * formulário com vários campos lado a lado isso disparava vários tooltips
 * ao simplesmente mover o cursor pela tela. Aqui o hover/foco fica restrito
 * ao ÍCONE (um `<button>` real), nunca ao campo em volta.
 *
 * COMO É POSICIONADO: `.field-tooltip` (ver ./tooltip.scss) é absoluto no
 * canto superior direito do wrapper do campo — o wrapper
 * (components/ui/FormGrid/Input/index.tsx) já tem a classe utilitária
 * `position-relative` do Bootstrap para servir de referência.
 *
 * DEPENDÊNCIAS: ./tooltip.scss — importado UMA VEZ em styles/_custom.scss
 * (não aqui: import de estilo fica centralizado, ver CLAUDE.md do frontend
 * "Regra de ouro"), não em cada arquivo que usa o componente.
 * CONSUMIDORES: components/ui/FormGrid/Input/index.tsx — renderiza
 * `{field.title && <FieldTooltip text={field.title} />}` dentro do wrapper
 * de CADA um dos tipos de campo, só quando o schema tem `title`.
 *
 * COMO REAPROVEITAR: não precisa — é genérico. Qualquer `*FieldSchema` do
 * FormGrid que tenha `title` já ganha o tooltip automaticamente pelo
 * dispatcher, sem tocar no componente do campo em si.
 * -------------------------------------------------------------------------
 */

export interface FieldTooltipProps {
  /** Texto de ajuda (fc_help_text) a exibir no tooltip. */
  text: string
}

/** Ícone "ⓘ" que só revela o tooltip no hover/foco de SI MESMO — nunca do campo em volta. */
export default function FieldTooltip({ text }: FieldTooltipProps) {
  return (
    <span className="field-tooltip">
      <button type="button" className="field-tooltip-icon" aria-label={text}>
        <span aria-hidden="true">ⓘ</span>
      </button>
      <span className="field-tooltip-bubble" role="tooltip">
        {text}
      </span>
    </span>
  )
}
