/**
 * =========================================================================
 * FILE HEADER — components/map/FormCenterPicker.tsx
 * =========================================================================
 *
 * PROPOSITO: escolhe um ponto (centro de um mapa, posicao de um ponto) clicando num mapa, buscando um
 * endereco ou usando a localizacao do navegador, e preenche os campos latitude, longitude e (opcional)
 * zoom do <form> em que esta.
 * Dirigido por props (nomes dos campos); nao conhece rota nem modulo.
 *
 *   <FormCenterPicker latName="center_lat" lngName="center_lng" zoomName="zoom" />   // centro do mapa
 *   <FormCenterPicker latName="lat" lngName="lng" label="ponto" initialZoom={15} />     // sem zoom
 *
 * COMO FALA COM O FORM: o FormGrid e nao controlado (inputs com defaultValue, payload lido do
 * FormData). Entao o componente le/escreve os inputs pelo nome, dentro do <form> mais proximo, usando
 * o setter nativo + evento `input` (mesmo truque do autoSlug do RecordFormBuild). Digitar nos campos
 * move o marcador (escuta `input` no form).
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import AddressSearch from '@/components/map/AddressSearch';
import MapView from '@/components/map/MapView';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { GeoAddress, LatLng, MapMarker } from '@/types/map';
import { toCoord } from '@/types/map';
import { FALLBACK_CENTER, FALLBACK_ZOOM, searchViewbox } from '@/utils/mapRegion';

export interface FormCenterPickerProps {
  latName: string;
  lngName: string;
  /** Sem zoomName o zoom do mapa nao e gravado (ex.: cadastro de ponto). */
  zoomName?: string | undefined;
  /** Zoom inicial quando o formulario nao traz um. */
  initialZoom?: number | undefined;
  /** Como chamar o ponto nos textos (padrao: centro). */
  label?: string | undefined;
  height?: number | undefined;
}

function field(form: HTMLFormElement | null, name: string | undefined): HTMLInputElement | null {
  if (!name) return null;
  const el = form?.elements.namedItem(name);
  return el instanceof HTMLInputElement ? el : null;
}

/** Escreve pelo setter nativo e avisa o React/FormGrid, como se tivesse sido digitado. */
function writeField(form: HTMLFormElement | null, name: string | undefined, value: string): void {
  const input = field(form, name);
  if (!input || input.value === value) return;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

export default function FormCenterPicker({
  latName,
  lngName,
  zoomName,
  initialZoom = FALLBACK_ZOOM,
  label = 'centro',
  height = 360,
}: FormCenterPickerProps) {
  const root = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [position, setPosition] = useState<LatLng>(FALLBACK_CENTER);
  const [zoom, setZoom] = useState(initialZoom);
  // Marcador so aparece com coordenada valida (no cadastro de ponto os campos nascem vazios).
  const [hasPoint, setHasPoint] = useState(false);
  // Remonta o mapa quando o centro muda por busca/GPS (o centro inicial do Leaflet so vale na criacao).
  const [recenterTick, setRecenterTick] = useState(0);
  const geo = useGeolocation();

  const readForm = useCallback(() => {
    const form = formRef.current;
    const lat = toCoord(field(form, latName)?.value);
    const lng = toCoord(field(form, lngName)?.value);
    const z = Number(field(form, zoomName)?.value);

    if (lat !== null && lng !== null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      setPosition((prev) => (prev.lat === lat && prev.lng === lng ? prev : { lat, lng }));
      setHasPoint(true);
    } else {
      setHasPoint(false);
    }
    if (Number.isFinite(z) && z > 0) setZoom(z);
  }, [latName, lngName, zoomName]);

  // Liga ao <form> pai, le os valores iniciais e acompanha o que for digitado.
  useEffect(() => {
    const form = root.current?.closest('form') ?? null;
    formRef.current = form;
    readForm();
    setRecenterTick((n) => n + 1);
    form?.addEventListener('input', readForm);
    return () => form?.removeEventListener('input', readForm);
  }, [readForm]);

  const apply = useCallback(
    (next: LatLng, recenter: boolean) => {
      const form = formRef.current;
      setPosition(next);
      setHasPoint(true);
      writeField(form, latName, next.lat.toFixed(6));
      writeField(form, lngName, next.lng.toFixed(6));
      if (recenter) {
        // Busca/GPS num ponto (sem campo de zoom): aproxima para ver a rua.
        if (!zoomName) setZoom(15);
        setRecenterTick((n) => n + 1);
      }
    },
    [latName, lngName, zoomName],
  );

  const onZoom = useCallback(
    (z: number) => {
      setZoom(z);
      writeField(formRef.current, zoomName, String(z));
    },
    [zoomName],
  );

  const onAddress = useCallback((address: GeoAddress) => apply({ lat: address.lat, lng: address.lng }, true), [apply]);

  useEffect(() => {
    if (geo.fix) apply({ lat: geo.fix.lat, lng: geo.fix.lng }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.fix]);

  const markers: MapMarker[] = hasPoint
    ? [{ id: 'picked', position, title: `Posição do ${label}`, icon: 'bi-geo-alt-fill', color: '#dc3545' }]
    : [];

  return (
    <div ref={root} className="row g-3 mt-1">
      <div className="col-lg-4">
        <AddressSearch
          compact
          label={`Buscar o ${label} por endereço`}
          fieldName="center_picker_query"
          placeholder="Ex.: Praça Mauá, Rio de Janeiro"
          viewbox={searchViewbox()}
          onSelect={onAddress}
        />
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm mt-2"
          onClick={geo.request}
          disabled={geo.status === 'loading'}
        >
          <i className="bi bi-crosshair me-1" aria-hidden="true" />
          Usar minha localização
        </button>
        {geo.error && <div className="text-danger small mt-2">{geo.error}</div>}
        <div className="small text-body-secondary mt-3">
          Clique no mapa para definir o {label}.{zoomName ? ' O zoom do mapa vira o zoom do cadastro.' : ''}
        </div>
      </div>
      <div className="col-lg-8">
        <MapView
          key={recenterTick}
          height={height}
          center={position}
          zoom={zoom}
          markers={markers}
          fitToContent={false}
          onMapClick={(p) => apply(p, false)}
          {...(zoomName ? { onZoomChange: onZoom } : {})}
        />
      </div>
    </div>
  );
}
