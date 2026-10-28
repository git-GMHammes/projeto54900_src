// Template da sessao: busca GET template-render/get quando ha usuario autenticado e devolve os dados
// (template efetivo, nav, menu lateral, cabecalhos e rodapes). Recarrega quando o usuario muda ou
// quando ele escolhe outro template (user.temp_manager_id). Sem sessao nao consulta a API: o visitante
// usa o template do env (config/env.ts: guestTemplate).

import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { templateRenderGet } from '@/services/v1';
import { normalizeItem } from '@/utils/apiResult';
import { parseTemplateRender } from '@/types/template';
import type { TemplateRenderData } from '@/types/template';

export interface UseTemplateResult {
  data: TemplateRenderData | null;
  loading: boolean;
  /** true quando a API falhou: o layout cai no modo reduzido (sem menu do template). */
  failed: boolean;
}

export function useTemplate(): UseTemplateResult {
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id ?? null;
  const preferred = user?.temp_manager_id ?? null;
  const [data, setData] = useState<TemplateRenderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setData(null);
      setFailed(false);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setFailed(false);
    templateRenderGet()
      .then((payload) => {
        if (active) setData(parseTemplateRender(normalizeItem<Record<string, unknown>>(payload)));
      })
      .catch(() => {
        if (active) {
          setData(null);
          setFailed(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, userId, preferred]);

  return { data, loading, failed };
}
