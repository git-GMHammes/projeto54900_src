// Regra do projeto: toda ação executada numa lista (botão de ação de list_actions
// que chama a API) mostra um toast com o que aconteceu. Ações de navegação (link)
// e de visualização (modal) não geram toast de resultado.
//
// Uso no ponto de sucesso da ação:
//   notifyActionDone(toast, action, subject);
//   onExecuted();

import type { ListActionRow } from '@/utils/listConstructor';

/** Subconjunto do toast usado aqui (aceita o toast de useToast). */
export interface ActionToast {
  success: (message: string, opts?: { title?: string }) => unknown;
}

/** Toast de sucesso: "<ação>: <identificação da linha> — concluído." */
export function notifyActionDone(toast: ActionToast, action: ListActionRow, subject?: string): void {
  const label = action.label || 'Ação';
  const what = subject ? `${label}: ${subject}` : label;
  toast.success(`${what} — concluído com sucesso.`, { title: label });
}
