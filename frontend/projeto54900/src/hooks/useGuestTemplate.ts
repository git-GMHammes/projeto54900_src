// Template do VISITANTE (antes do login): variante, cabecalho(s) e rodape(s) da empresa do slug da URL
// (/<slug>/v1/login), pela rota PUBLICA template-public/get/{slug}. Nav e menu NAO vem desta rota: o visitante
// so tem Home e Entrar. Sem slug na URL, ou se a chamada falha, devolve null e o layout usa o template do env
// (guestTemplate) e o rodape simples. So consulta enquanto `enabled` (visitante): depois do login quem manda
// e template-render/get.

import { useEffect, useState } from 'react';

import { companySlug } from '@/config/env';
import { templatePublicGet } from '@/services/v1';
import { normalizeItem } from '@/utils/apiResult';
import { parseTemplateRender } from '@/types/template';
import type { TemplateRenderData } from '@/types/template';

export interface UseGuestTemplateResult {
  /** Template, cabecalhos e rodapes da empresa do slug (nav e menu vazios); null = usar o do env. */
  data: TemplateRenderData | null;
  loading: boolean;
}

export function useGuestTemplate(enabled: boolean): UseGuestTemplateResult {
  const [data, setData] = useState<TemplateRenderData | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!enabled || companySlug === null || resolved) return;

    let active = true;
    templatePublicGet(companySlug)
      .then((payload) => {
        if (active) setData(parseTemplateRender(normalizeItem<Record<string, unknown>>(payload)));
      })
      .catch(() => {
        if (active) setData(null);
      })
      .finally(() => {
        if (active) setResolved(true);
      });

    return () => {
      active = false;
    };
  }, [enabled, resolved]);

  return { data, loading: enabled && companySlug !== null && !resolved };
}
