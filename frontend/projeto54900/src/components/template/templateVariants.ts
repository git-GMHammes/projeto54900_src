// Variantes visuais do template. O `code` vem de temp_manager (template001, template002, template003) e o codigo
// do frontend reconhece estes tres; um code desconhecido cai no template001.
//
//   template001  bordas arredondadas 3D; menu lateral em coluna (>= lg) e painel (< lg)
//   template002  sem bordas, regioes em degrade; mesmo menu lateral
//   template003  sem bordas; menu lateral SEMPRE em painel Offcanvas, aberto pelo botao dos quadradinhos no nav

export interface TemplateVariant {
  code: 'template001' | 'template002' | 'template003';
  /** Sem bordas, sombras, cantos arredondados nem margens (degrade entre regioes). */
  flat: boolean;
  /** Menu lateral sempre em Offcanvas (sem coluna fixa). */
  offcanvasOnly: boolean;
}

const VARIANTS: Record<TemplateVariant['code'], TemplateVariant> = {
  template001: { code: 'template001', flat: false, offcanvasOnly: false },
  template002: { code: 'template002', flat: true, offcanvasOnly: false },
  template003: { code: 'template003', flat: true, offcanvasOnly: true },
};

export function resolveVariant(code: string | null | undefined): TemplateVariant {
  return (code && code in VARIANTS ? VARIANTS[code as TemplateVariant['code']] : VARIANTS.template001);
}
