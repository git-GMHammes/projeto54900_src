/**
 * =========================================================================
 * FILE HEADER — hooks/useGoBack.ts
 * =========================================================================
 *
 * PROPOSITO: acao do botao "Voltar" = voltar para a ULTIMA TELA visitada (historico do
 * navegador). Se a tela foi aberta direto (nova aba, link colado, recarga sem historico
 * do app), cai no caminho de reserva informado, para o botao nunca ficar sem efeito.
 *
 * DETECCAO: `location.key === 'default'` e a primeira entrada do historico do app (react-router).
 *
 * CONSUMIDORES: components/global/ListBuild (prop backFallback), RecordFormBuild (Voltar),
 * pages/v1/map/explorer/ExplorerPage e pages/v1/map/links/LinksPage.
 * -------------------------------------------------------------------------
 */

import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useGoBack(fallback: string): () => void {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (location.key !== 'default') {
      void navigate(-1);
    } else {
      void navigate(fallback);
    }
  }, [navigate, location.key, fallback]);
}

export default useGoBack;
