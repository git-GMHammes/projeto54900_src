/**
 * =========================================================================
 * FILE HEADER — components/global/PageHeader.tsx
 * =========================================================================
 *
 * PROPOSITO: cabecalho padrao de pagina — titulo, subtitulo opcional e uma
 * area de acoes a direita (via `children`, ex.: botao "Voltar", "Novo").
 *
 * DEPENDENCIAS: nenhuma (so tipos de react).
 * CONSUMIDORES: praticamente toda pagina de pages/v1/** (RegisterPage e
 * as demais paginas de listagem/detalhe/CRUD).
 *
 * COMO REAPROVEITAR: `title` e obrigatorio; `subtitle` para contexto extra;
 * `children` para botoes/links de acao (renderizados a direita, com quebra
 * de linha automatica em telas estreitas).
 * -------------------------------------------------------------------------
 */

import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        {subtitle && <p className="text-body-secondary mb-0">{subtitle}</p>}
      </div>
      {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
