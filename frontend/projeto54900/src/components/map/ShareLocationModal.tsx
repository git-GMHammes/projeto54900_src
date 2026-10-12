/**
 * =========================================================================
 * FILE HEADER — components/map/ShareLocationModal.tsx
 * =========================================================================
 *
 * PROPOSITO: modal "Compartilhar localizacao" das conversas. Ao abrir, pede a posicao ao navegador
 * (que pergunta se o usuario AUTORIZA), mostra o ponto no mapa com o raio de precisao e o endereco
 * aproximado (map-geo/reverse, opcional) e so envia depois da confirmacao explicita.
 *
 *   {open && <ShareLocationModal onClose={...} onSend={(content) => enviar(content)} />}
 *
 * `onSend` recebe o texto pronto da mensagem (com o geo URI — utils/geoUri.ts); quem chama envia
 * pelo fluxo normal da conversa. Carregue com React.lazy: o Leaflet so entra ao abrir este modal.
 * -------------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from 'react';

import LoadingOverlay from '@/components/global/LoadingOverlay';
import Modal from '@/components/global/Modal';
import MapView from '@/components/map/MapView';
import { useGeolocation } from '@/hooks/useGeolocation';
import { mapGeo } from '@/services/v1';
import type { MapCircle, MapMarker } from '@/types/map';
import { buildLocationMessage } from '@/utils/geoUri';
import { errorText } from '@/utils/mapLinks';

export interface ShareLocationModalProps {
  onClose: () => void;
  /** Envia o texto da mensagem de localizacao; rejeitar mantem o modal aberto com o erro. */
  onSend: (content: string) => Promise<void>;
}

/** Precisao acima disto (m) costuma indicar computador sem GPS (posicao por Wi-Fi/IP). */
const LOW_ACCURACY_M = 500;

export default function ShareLocationModal({ onClose, onSend }: ShareLocationModalProps) {
  const { status, fix, error, request } = useGeolocation();
  const [address, setAddress] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Ao abrir: pede a posicao (o navegador mostra o pedido de permissao).
  useEffect(() => {
    request();
  }, [request]);

  // Endereco aproximado: so informativo; falha (sem endereco, limite, etc.) e ignorada.
  useEffect(() => {
    if (!fix) return;
    let active = true;
    setAddress(null);
    mapGeo
      .reverse(fix.lat, fix.lng)
      .then((found) => {
        if (active) setAddress(found.display_name.split(',').slice(0, 3).join(',').trim());
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [fix]);

  const markers = useMemo<MapMarker[]>(
    () => (fix ? [{ id: 'me', position: { lat: fix.lat, lng: fix.lng }, title: 'Você está aqui', icon: 'bi-geo-alt-fill', color: '#dc3545' }] : []),
    [fix],
  );
  const circles = useMemo<MapCircle[]>(
    () => (fix && fix.accuracy > 0 ? [{ id: 'accuracy', position: { lat: fix.lat, lng: fix.lng }, radiusM: fix.accuracy, color: '#dc3545' }] : []),
    [fix],
  );

  async function handleSend() {
    if (!fix) return;
    setSending(true);
    setSendError(null);
    try {
      await onSend(buildLocationMessage(address, fix));
    } catch (e) {
      setSendError(errorText(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal open title="Compartilhar localização" size="lg" onClose={() => (sending ? undefined : onClose())}>
      {status === 'loading' && <LoadingOverlay label="Aguardando a autorização e a posição… (aceite o pedido do navegador)" />}

      {status === 'error' && (
        <div>
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={request}>
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
            Tentar de novo
          </button>
        </div>
      )}

      {status === 'ready' && fix && (
        <div>
          <MapView height={300} markers={markers} circles={circles} />
          <div className="mt-2 small">
            {address && <div className="fw-semibold">{address}</div>}
            <div className="text-body-secondary">
              {fix.lat.toFixed(5)}, {fix.lng.toFixed(5)}
              {fix.accuracy > 0 ? ` · precisão de cerca de ${Math.round(fix.accuracy)} m` : ''}
            </div>
          </div>
          {fix.accuracy > LOW_ACCURACY_M && (
            <div className="alert alert-warning py-2 mt-2 mb-0 small" role="status">
              A precisão está baixa (comum em computador sem GPS). O ponto enviado pode estar a centenas de metros do local real.
            </div>
          )}
          <p className="small text-body-secondary mt-3 mb-0">
            Sua localização <strong>atual</strong> será enviada para todos desta conversa.
          </p>
        </div>
      )}

      {sendError && (
        <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">
          {sendError}
        </div>
      )}

      <div className="d-flex gap-2 justify-content-end mt-3 pt-3 border-top">
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={sending}>
          Cancelar
        </button>
        <button type="button" className="btn btn-primary" onClick={() => void handleSend()} disabled={!fix || sending}>
          {sending ? <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" /> : <i className="bi bi-send me-1" aria-hidden="true" />}
          Enviar localização
        </button>
      </div>
    </Modal>
  );
}
