// Estado vazio / erro para listagens e detalhes.

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title?: ReactNode;
  description?: ReactNode;
  variant?: 'muted' | 'danger';
  children?: ReactNode;
}

export default function EmptyState({
  title = 'Nada por aqui',
  description,
  variant = 'muted',
  children,
}: EmptyStateProps) {
  const border = variant === 'danger' ? 'border-danger-subtle' : 'border-secondary-subtle';
  const text = variant === 'danger' ? 'text-danger' : 'text-body-secondary';

  return (
    <div className={`text-center border rounded-3 p-5 ${border}`}>
      <p className={`h5 mb-1 ${text}`}>{title}</p>
      {description && <p className="text-body-secondary mb-3">{description}</p>}
      {children}
    </div>
  );
}
