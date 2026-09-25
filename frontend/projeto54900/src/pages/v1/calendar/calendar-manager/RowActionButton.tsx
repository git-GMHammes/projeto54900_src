import type { ReactNode } from 'react';

import { useToast } from '@/hooks/useToast';
import { http, ApiError } from '@/services/http';
import { resolveEndpoint } from '@/utils/formSubmit';
import { resolveHrefTemplate } from '@/utils/listConstructor';
import type { ListActionRow } from '@/utils/listConstructor';

/**
 * Botão só-ícone de uma ação de `list_actions` para uma linha (calendário ou
 * evento). 'modal' avisa a página (que decide qual modal abrir, pelo slug em
 * hrefTemplate); 'api_call' executa de verdade (mesmo padrão do
 * FormConstructorListPage.tsx) — `{campo}` do endpoint/mensagem sai de `row`.
 */
export default function RowActionButton({
  action,
  row,
  onOpenModal,
  onExecuted,
}: {
  action: ListActionRow;
  row: Record<string, unknown>;
  onOpenModal?: ((targetSlug: string) => void) | undefined;
  onExecuted: (action: ListActionRow) => void;
}) {
  const toast = useToast();

  if (action.actionType === 'link') return null;

  // Tooltip custom (bolha CSS, styles/_custom.scss) em vez do `title` nativo
  // do navegador — este ultimo tem fonte fixa do SO e brigaria visualmente
  // com a bolha se os dois aparecessem juntos no hover.
  const withTooltip = (button: ReactNode) => (
    <span className="icon-action-tooltip">
      {button}
      <span className="icon-action-tooltip-bubble" role="tooltip">
        {action.label}
      </span>
    </span>
  );

  if (action.actionType === 'modal') {
    if (!onOpenModal) return null;
    return withTooltip(
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        aria-label={action.label}
        onClick={() => onOpenModal(action.hrefTemplate)}
      >
        <i className={`bi bi-${action.icon}`} />
      </button>,
    );
  }

  const execute = async () => {
    const message = resolveHrefTemplate(action.confirmMessage, row) || `Confirma ${action.label}?`;
    if (action.confirm && !window.confirm(message)) return;
    try {
      const path = resolveEndpoint(resolveHrefTemplate(action.apiEndpoint, row));
      const method = action.httpMethod.toUpperCase();
      if (method === 'DELETE') await http.delete(path);
      else if (method === 'PUT') await http.put(path);
      else if (method === 'PATCH') await http.patch(path);
      else if (method === 'POST') await http.post(path);
      else await http.get(path);
      onExecuted(action);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao executar a ação.', { title: action.label });
    }
  };

  return withTooltip(
    <button
      type="button"
      className="btn btn-sm btn-outline-danger"
      aria-label={action.label}
      onClick={() => void execute()}
    >
      <i className={`bi bi-${action.icon}`} />
    </button>,
  );
}
