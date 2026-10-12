/**
 * =========================================================================
 * FILE HEADER — components/map/ViewLocationModal.tsx
 * =========================================================================
 *
 * PROPOSITO: modal SOMENTE LEITURA que mostra no mapa uma localizacao recebida numa mensagem
 * (geo URI), com o raio de precisao e um link para abrir no OpenStreetMap.
 *
 *   {geo && <ViewLocationModal geo={geo} title="Localização de Fulano" onClose={...} />}
 *
 * Carregue com React.lazy: o Leaflet so entra ao abrir este modal.
 * -------------------------------------------------------------------------
 */

import { useMemo } from 'react';

import Modal from '@/components/global/Modal';
import MapView from '@/components/map/MapView';
import type { MapCircle, MapMarker } from '@/types/map';
import { openStreetMapUrl } from '@/utils/geoUri';
import type { GeoFix } from '@/utils/geoUri';

export interface ViewLocationModalProps {
  geo: GeoFix;
  title?: string | undefined;
  onClose: () => void;
}

export default function ViewLocationModal({ geo, title = 'Localização compartilhada', onClose }: ViewLocationModalProps) {
  const markers = useMemo<MapMarker[]>(
    () => [{ id: 'shared', position: { lat: geo.lat, lng: geo.lng }, title, icon: 'bi-geo-alt-fill', color: '#dc3545' }],
    [geo.lat, geo.lng, title],
  );
  const circles = useMemo<MapCircle[]>(
    () => (geo.accuracy > 0 ? [{ id: 'accuracy', position: { lat: geo.lat, lng: geo.lng }, radiusM: geo.accuracy, color: '#dc3545' }] : []),
    [geo.lat, geo.lng, geo.accuracy],
  );

  return (
    <Modal open title={title} size="lg" onClose={onClose}>
      <MapView height={340} markers={markers} circles={circles} />
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2 small">
        <span className="text-body-secondary">
          {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}
          {geo.accuracy > 0 ? ` · precisão de cerca de ${Math.round(geo.accuracy)} m` : ''}
        </span>
        <a className="btn btn-outline-secondary btn-sm" href={openStreetMapUrl(geo)} target="_blank" rel="noopener noreferrer">
          <i className="bi bi-box-arrow-up-right me-1" aria-hidden="true" />
          Abrir no OpenStreetMap
        </a>
      </div>
    </Modal>
  );
}
