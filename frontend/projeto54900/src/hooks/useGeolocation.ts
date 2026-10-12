/**
 * =========================================================================
 * FILE HEADER — hooks/useGeolocation.ts
 * =========================================================================
 *
 * PROPOSITO: pede ao navegador a posicao atual do usuario (navigator.geolocation: GPS, Wi-Fi e
 * antenas), com AUTORIZACAO dele, e devolve estado + posicao + mensagem de erro em portugues.
 * Nao usa IP nem roteador (imprecisos). So funciona em contexto seguro (https ou localhost).
 *
 *   const { status, fix, error, request } = useGeolocation();
 *   request();   // dispara o pedido de permissao e a leitura
 *
 * ERROS TRATADOS: contexto inseguro, navegador sem suporte, permissao negada, posicao
 * indisponivel e tempo esgotado.
 *
 * CONSUMIDOR: components/map/ShareLocationModal.tsx.
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { GeoFix } from '@/utils/geoUri';

export type GeolocationStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseGeolocationResult {
  status: GeolocationStatus;
  fix: GeoFix | null;
  error: string | null;
  request: () => void;
}

function describeError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Permissão negada. Libere a localização para este site (ícone de cadeado ao lado do endereço) e tente de novo.';
    case error.POSITION_UNAVAILABLE:
      return 'Não foi possível obter sua posição agora (sem sinal de GPS ou Wi-Fi). Tente de novo em instantes.';
    case error.TIMEOUT:
      return 'A localização demorou demais para responder. Tente de novo.';
    default:
      return 'Não foi possível obter sua localização.';
  }
}

export function useGeolocation(): UseGeolocationResult {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [fix, setFix] = useState<GeoFix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const request = useCallback(() => {
    setError(null);

    if (!window.isSecureContext) {
      setStatus('error');
      setError('A localização só funciona em conexão segura (https) ou em localhost.');
      return;
    }

    if (!('geolocation' in navigator)) {
      setStatus('error');
      setError('Este navegador não oferece localização.');
      return;
    }

    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!alive.current) return;
        setFix({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy });
        setStatus('ready');
      },
      (failure) => {
        if (!alive.current) return;
        setFix(null);
        setStatus('error');
        setError(describeError(failure));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  return { status, fix, error, request };
}

export default useGeolocation;
