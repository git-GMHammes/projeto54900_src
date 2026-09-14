// Layout padrao: Navbar + conteudo (container) + Footer.
// Renderiza as rotas-filhas via <Outlet/>.
//
// ApiDebugPanel fica sempre por ultimo dentro de <main>, apos o conteudo da
// rota — padrao absoluto: qualquer que seja o conteudo da pagina (lista,
// paginacao, indice, card, etc.), o DEBUG vem depois de tudo.

import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ApiDebugPanel from '@/components/global/ApiDebugPanel';

export default function RootLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="container py-4 flex-grow-1">
        <Outlet />
        <ApiDebugPanel />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
