// STUB — campo de formulario EM BRANCO ate a fabrica de forms (FormGrid).
//
// A versao anterior (label + controle Bootstrap + feedback de erro, com
// `as="input|textarea|select"`) esta no backup. Sera substituida pela fabrica
// dirigida por schema JSON — ver src/markdown/geral/README_FormGrid.md.

import type { ReactNode } from 'react';

export interface FormFieldProps {
  label?: ReactNode;
  name: string;
  value?: string;
  onChange?: (value: string, event: unknown) => void;
  error?: string;
  hint?: ReactNode;
  as?: 'input' | 'textarea' | 'select';
  type?: string;
  required?: boolean;
  children?: ReactNode;
}

export default function FormField(_props: FormFieldProps): ReactNode {
  return (
    <div className="alert alert-secondary border d-flex align-items-center gap-2" role="status">
      <span className="badge text-bg-secondary">stub</span>
      <span>Campo de formulario em branco — aguardando a fabrica de forms (FormGrid).</span>
    </div>
  );
}
