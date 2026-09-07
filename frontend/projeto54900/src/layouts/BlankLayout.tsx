// Layout minimo (sem navbar/footer). Usado por telas de erro e paginas isoladas.
// Dual-use: como layout de rota renderiza <Outlet/>; com `children` renderiza os filhos.

import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';

export interface BlankLayoutProps {
  children?: ReactNode;
}

export default function BlankLayout({ children }: BlankLayoutProps) {
  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center bg-body-tertiary p-3">
      <div className="w-100" style={{ maxWidth: 520 }}>
        {children ?? <Outlet />}
      </div>
    </div>
  );
}
