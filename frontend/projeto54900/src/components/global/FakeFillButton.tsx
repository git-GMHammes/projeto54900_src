/**
 * =========================================================================
 * FILE HEADER — components/global/FakeFillButton.tsx
 * =========================================================================
 *
 * PROPOSITO: botao flutuante DEV-ONLY que preenche o formulario da tela
 * atual com dados fake validos, para agilizar teste manual. So renderiza
 * quando isDevHost() (config/envHost.ts) e verdadeiro E existe um script
 * registrado para a `slug` recebida (dev/fakeFill/registry.ts) — mesma
 * dupla condicao usada por ApiDebugPanel.tsx para features dev-only.
 *
 * POSICAO: fixed, canto inferior esquerdo, semi-transparente (opacity
 * baixa em repouso, 1 no hover/foco) — nao pode competir visualmente com o
 * conteudo da pagina nem com a UI de producao (nunca aparece fora de
 * DEV_HOSTS).
 *
 * DEPENDENCIAS: config/envHost (isDevHost), dev/fakeFill/registry
 * (getFakeFillScript), hooks/useToast (feedback de sucesso/erro).
 * CONSUMIDORES: pages/v1/form/FormRendererPage.tsx (montado so enquanto o
 * modal do formulario esta aberto).
 *
 * COMO REAPROVEITAR PARA OUTRA TELA: renderizar <FakeFillButton slug="..."/>
 * junto do formulario em questao, depois de registrar o script em
 * dev/fakeFill/registry.ts — nao precisa mexer neste arquivo.
 * -------------------------------------------------------------------------
 */

import { useState } from 'react';
import { isDevHost } from '@/config/envHost';
import { getFakeFillScript } from '@/dev/fakeFill/registry';
import { useToast } from '@/hooks/useToast';

export interface FakeFillButtonProps {
  /** slug do formulario (mesma da rota /v1/form/:slug) — chave do registry. */
  slug: string;
}

export default function FakeFillButton({ slug }: FakeFillButtonProps) {
  const toast = useToast();
  const [running, setRunning] = useState(false);
  const script = getFakeFillScript(slug);

  if (!isDevHost() || !script) return null;

  const handleClick = async (): Promise<void> => {
    setRunning(true);
    try {
      await script();
    } catch (err) {
      toast.error('Falha ao preencher com dados fake (ver console).', { title: 'Fake fill' });
      console.warn('[FakeFillButton] script falhou para a slug', slug, err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-sm btn-dark d-inline-flex align-items-center gap-2 shadow"
      onClick={() => void handleClick()}
      disabled={running}
      title="Preencher formulário com dados fake (dev-only)"
      style={{
        position: 'fixed',
        left: '1rem',
        bottom: '1rem',
        zIndex: 1080,
        opacity: running ? 0.9 : 0.55,
        transition: 'opacity .15s ease-in-out',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = running ? '0.9' : '0.55')}
    >
      <i className="bi bi-dice-5-fill" />
      {running ? 'Preenchendo...' : 'Fake fill'}
    </button>
  );
}
