/**
 * =========================================================================
 * FILE HEADER — components/global/FormField.tsx
 * =========================================================================
 *
 * PROPOSITO: STUB — campo de formulario EM BRANCO ate a fabrica de forms
 * (FormGrid, ver components/ui/FormGrid/). A versao anterior (label +
 * controle Bootstrap + feedback de erro, com `as="input|textarea|select"`)
 * esta no backup. Sera substituida pela fabrica dirigida por schema JSON —
 * ver src/markdown/geral/README_FormGrid.md. NAO REIMPLEMENTAR AQUI: este
 * arquivo so mantem o modulo importavel e preserva o contrato de props
 * (`FormFieldProps`).
 *
 * DEPENDENCIAS: nenhuma (so tipos de react).
 * CONSUMIDORES: nenhum ainda — components/ui/FormGrid/* ja e a fabrica real
 * (schema-driven) que substitui este stub; paginas novas devem usar
 * <FormGrid> em vez deste componente.
 *
 * COMO REAPROVEITAR: nao usar este componente para campos novos — usar
 * components/ui/FormGrid/Input (<FormGrid>) com um schema de linhas/campos.
 * -------------------------------------------------------------------------
 */

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
