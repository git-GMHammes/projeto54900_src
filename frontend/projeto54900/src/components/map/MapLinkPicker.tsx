/**
 * =========================================================================
 * FILE HEADER — components/map/MapLinkPicker.tsx
 * =========================================================================
 *
 * PROPOSITO: modal para VINCULAR a um registro de qualquer modulo um endereco,
 * um CEP, um ponto no mapa ou uma rota (tabela map_links). Cria o destino pelas
 * APIs map-* e depois o vinculo.
 *
 *   <MapLinkPicker open module="calendar-events" referenceId={12}
 *                  collection="travel" onClose={...} onLinked={reload} />
 *
 * ABAS:
 *   Endereco — AddressSearch (Nominatim) -> cria map_addresses -> vinculo address
 *   CEP      — CepSearch (map-geo/cep)   -> usa map_postal_codes.id -> vinculo postal_code
 *   Ponto    — clique no mapa ou lat/lng + nome + mapa -> cria map_points -> vinculo point
 *   Rota     — paradas por clique/busca + RoutePlanner -> "Calcular e gravar"
 *              (map_routes + paradas) -> vinculo route
 *
 * O modulo precisa estar registrado em Config/MapLinkables.php (backend); senao
 * o servidor responde 422 e a mensagem aparece no modal.
 * -------------------------------------------------------------------------
 */

import { useMemo, useState } from 'react';

import Modal from '@/components/global/Modal';
import AddressSearch from '@/components/map/AddressSearch';
import CepSearch from '@/components/map/CepSearch';
import MapView from '@/components/map/MapView';
import RoutePlanner from '@/components/map/RoutePlanner';
import type { PlannerStop } from '@/components/map/RoutePlanner';
import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import { useToast } from '@/hooks/useToast';
import { mapAddressesTable, mapLinksTable, mapPointsTable } from '@/services/v1';
import type { GeoAddress, GeoRouteResult, LatLng, MapMarker, MapPolyline, PostalCodeRow, RouteProfile } from '@/types/map';
import { toCoord } from '@/types/map';
import { normalizeItem } from '@/utils/apiResult';
import { LINK_COLORS, LINK_ICONS, LINK_LABELS, errorText } from '@/utils/mapLinks';
import type { MapLinkType } from '@/types/map';

export interface MapLinkPickerProps {
  open: boolean;
  /** Slug do modulo dono (registrado em Config/MapLinkables.php). */
  module: string;
  referenceId: number | string;
  /** Papel do vinculo (ex.: 'origin'); vazio = 'default'. */
  collection?: string | undefined;
  onClose: () => void;
  /** Chamado depois de vincular com sucesso (a lista deve recarregar). */
  onLinked: () => void;
}

const TABS: readonly { type: MapLinkType; label: string }[] = [
  { type: 'address', label: LINK_LABELS.address },
  { type: 'postal_code', label: LINK_LABELS.postal_code },
  { type: 'point', label: LINK_LABELS.point },
  { type: 'route', label: LINK_LABELS.route },
];

const MAP_MANAGER_SRC = '/api/v1/map-manager-view/get-no-pagination?sort=title&order=ASC&limit=1000';

/** Remove chaves nulas/vazias antes de enviar ao backend (que descarta '' e valida null). */
function compact(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== ''));
}

function newId(): string {
  return `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createdId(payload: unknown): number {
  const row = normalizeItem<{ id?: number | string }>(payload);
  const id = Number(row?.id);
  if (!Number.isFinite(id) || id < 1) throw new Error('O servidor não devolveu o id do registro criado.');
  return id;
}

export default function MapLinkPicker({ open, module, referenceId, collection, onClose, onLinked }: MapLinkPickerProps) {
  const toast = useToast();

  const [tab, setTab] = useState<MapLinkType>('address');
  const [role, setRole] = useState(collection ?? '');
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [address, setAddress] = useState<GeoAddress | null>(null);
  const [postal, setPostal] = useState<PostalCodeRow | null>(null);

  const [mapManagerId, setMapManagerId] = useState('');
  const [pointName, setPointName] = useState('');
  const [pointLat, setPointLat] = useState('');
  const [pointLng, setPointLng] = useState('');

  const [profile, setProfile] = useState<RouteProfile>('driving-car');
  const [stops, setStops] = useState<PlannerStop[]>([]);
  const [routeResult, setRouteResult] = useState<GeoRouteResult | null>(null);

  const point: LatLng | null = useMemo(() => {
    const lat = toCoord(pointLat.replace(',', '.'));
    const lng = toCoord(pointLng.replace(',', '.'));
    return lat !== null && lng !== null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
  }, [pointLat, pointLng]);

  const commonSchema = useMemo<FormGridSchema>(
    () => ({
      rows: [
        {
          fields: [
            {
              col: 6,
              label: 'Papel do vínculo (opcional)',
              name: 'link_role',
              placeholder: 'Ex.: origem, destino, deslocamento',
              maxLength: 100,
              value: role,
              title: 'Distingue vários vínculos do mesmo registro (collection). Use letras, números, hífen ou sublinhado.',
              onChange: (e) => setRole(e.target.value),
            },
            {
              col: 6,
              label: 'Rótulo (opcional)',
              name: 'link_label',
              maxLength: 255,
              value: label,
              onChange: (e) => setLabel(e.target.value),
            },
          ],
        },
      ],
    }),
    [role, label],
  );

  const pointSchema = useMemo<FormGridSchema>(
    () => ({
      rows: [
        {
          fields: [
            {
              type: 'select',
              col: 12,
              label: 'Mapa do ponto',
              name: 'map_manager_id',
              placeholder: 'Escolha o mapa',
              src: MAP_MANAGER_SRC,
              valueKey: 'id',
              labelTemplate: '{title}',
              value: mapManagerId,
              onChange: (value: string) => setMapManagerId(value),
            },
          ],
        },
        {
          fields: [
            {
              col: 12,
              label: 'Nome do ponto',
              name: 'point_name',
              maxLength: 255,
              value: pointName,
              onChange: (e) => setPointName(e.target.value),
            },
            {
              col: 6,
              label: 'Latitude',
              name: 'point_lat',
              inputMode: 'decimal',
              placeholder: '-22.906800',
              value: pointLat,
              onChange: (e) => setPointLat(e.target.value),
            },
            {
              col: 6,
              label: 'Longitude',
              name: 'point_lng',
              inputMode: 'decimal',
              placeholder: '-43.172900',
              value: pointLng,
              onChange: (e) => setPointLng(e.target.value),
            },
          ],
        },
      ],
    }),
    [mapManagerId, pointName, pointLat, pointLng],
  );

  const routeMapSchema = useMemo<FormGridSchema>(
    () => ({
      rows: [
        {
          fields: [
            {
              type: 'select',
              col: 12,
              label: 'Mapa do trajeto',
              name: 'route_map_manager_id',
              placeholder: 'Escolha o mapa',
              src: MAP_MANAGER_SRC,
              valueKey: 'id',
              labelTemplate: '{title}',
              value: mapManagerId,
              onChange: (value: string) => setMapManagerId(value),
            },
          ],
        },
      ],
    }),
    [mapManagerId],
  );

  const markers = useMemo<MapMarker[]>(() => {
    const out: MapMarker[] = [];

    if (tab === 'address' && address) {
      out.push({
        id: 'pick-address',
        position: { lat: address.lat, lng: address.lng },
        title: address.display_name,
        icon: LINK_ICONS.address,
        color: LINK_COLORS.address,
      });
    }

    if (tab === 'postal_code' && postal) {
      const lat = toCoord(postal.lat);
      const lng = toCoord(postal.lng);
      if (lat !== null && lng !== null) {
        out.push({
          id: 'pick-cep',
          position: { lat, lng },
          title: `CEP ${postal.cep}`,
          icon: LINK_ICONS.postal_code,
          color: LINK_COLORS.postal_code,
        });
      }
    }

    if (tab === 'point' && point) {
      out.push({ id: 'pick-point', position: point, title: pointName || 'Novo ponto', icon: LINK_ICONS.point, color: LINK_COLORS.point });
    }

    if (tab === 'route') {
      stops.forEach((s, i) =>
        out.push({
          id: s.id,
          position: s.position,
          title: `${i + 1}. ${s.label}`,
          icon: LINK_ICONS.point,
          color: i === 0 ? '#198754' : i === stops.length - 1 ? '#dc3545' : LINK_COLORS.route,
        }),
      );
    }

    return out;
  }, [tab, address, postal, point, pointName, stops]);

  const lines = useMemo<MapPolyline[]>(
    () =>
      tab === 'route' && routeResult
        ? [{ id: 'pick-route', coordinates: routeResult.geometry.coordinates, color: LINK_COLORS.route }]
        : [],
    [tab, routeResult],
  );

  function handleMapClick(position: LatLng) {
    if (tab === 'point') {
      setPointLat(position.lat.toFixed(6));
      setPointLng(position.lng.toFixed(6));
    } else if (tab === 'route') {
      setStops((prev) => [...prev, { id: newId(), label: `Parada ${prev.length + 1}`, position }]);
    }
  }

  function addRouteStopFromAddress(found: GeoAddress) {
    const short = found.display_name.split(',').slice(0, 2).join(',').trim() || found.display_name;
    setStops((prev) => [...prev, { id: newId(), label: short, position: { lat: found.lat, lng: found.lng } }]);
  }

  async function createLink(extra: Record<string, unknown>) {
    await mapLinksTable.create(
      compact({
        module,
        reference_id: Number(referenceId),
        collection: role.trim() || 'default',
        label: label.trim(),
        ...extra,
      }),
    );
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      toast.success('Vínculo com o mapa criado.');
      onLinked();
      onClose();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  function linkAddress() {
    if (!address) return;
    void run(async () => {
      const created = await mapAddressesTable.create(
        compact({
          cep: address.cep,
          street: address.street,
          number: address.number,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          country: address.country,
          lat: address.lat,
          lng: address.lng,
          geocode_source: address.geocode_source,
          geocode_precision: address.geocode_precision,
          osm_type: address.osm_type,
          osm_id: address.osm_id,
          display_name: address.display_name.slice(0, 500),
        }),
      );
      await createLink({ link_type: 'address', map_address_id: createdId(created) });
    });
  }

  function linkPostalCode() {
    if (!postal) return;
    void run(() => createLink({ link_type: 'postal_code', map_postal_code_id: Number(postal.id) }));
  }

  function linkPoint() {
    if (!point || mapManagerId === '' || pointName.trim() === '') return;
    void run(async () => {
      const created = await mapPointsTable.create({
        map_manager_id: Number(mapManagerId),
        name: pointName.trim(),
        lat: point.lat,
        lng: point.lng,
      });
      await createLink({ link_type: 'point', map_point_id: createdId(created) });
    });
  }

  function linkSavedRoute(routeId: number) {
    void run(() => createLink({ link_type: 'route', map_route_id: routeId }));
  }

  const pointReady = point !== null && mapManagerId !== '' && pointName.trim() !== '';
  const clickable = tab === 'point' || tab === 'route';

  return (
    <Modal open={open} title="Vincular ao mapa" onClose={() => { if (!busy) onClose(); }} size="xl">
      <ul className="nav nav-tabs mb-3" role="tablist">
        {TABS.map((t) => (
          <li className="nav-item" role="presentation" key={t.type}>
            <button
              type="button"
              role="tab"
              aria-selected={tab === t.type}
              className={`nav-link ${tab === t.type ? 'active' : ''}`}
              onClick={() => {
                setTab(t.type);
                setError(null);
              }}
            >
              <i className={`bi ${LINK_ICONS[t.type]} me-1`} aria-hidden="true" />
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="row g-3">
        <div className="col-lg-5">
          <FormGrid schema={commonSchema} />
          <hr />

          {tab === 'address' && (
            <>
              <AddressSearch onSelect={setAddress} disabled={busy} />
              {address && (
                <div className="alert alert-success py-2 mt-3 mb-0 small">{address.display_name}</div>
              )}
              <button type="button" className="btn btn-success mt-3" disabled={!address || busy} onClick={linkAddress}>
                <i className="bi bi-link-45deg me-1" aria-hidden="true" />
                Vincular endereço
              </button>
            </>
          )}

          {tab === 'postal_code' && (
            <>
              <CepSearch onResolved={setPostal} disabled={busy} />
              <button type="button" className="btn btn-success mt-3" disabled={!postal || busy} onClick={linkPostalCode}>
                <i className="bi bi-link-45deg me-1" aria-hidden="true" />
                Vincular CEP
              </button>
            </>
          )}

          {tab === 'point' && (
            <>
              <p className="small text-body-secondary">Clique no mapa ou digite a latitude e a longitude.</p>
              <FormGrid schema={pointSchema} />
              <button type="button" className="btn btn-success mt-3" disabled={!pointReady || busy} onClick={linkPoint}>
                <i className="bi bi-link-45deg me-1" aria-hidden="true" />
                Criar ponto e vincular
              </button>
            </>
          )}

          {tab === 'route' && (
            <>
              <FormGrid schema={routeMapSchema} />
              <div className="mt-3">
                <AddressSearch onSelect={addRouteStopFromAddress} disabled={busy} />
              </div>
              <hr />
              <RoutePlanner
                stops={stops}
                onStopsChange={setStops}
                profile={profile}
                onProfileChange={setProfile}
                onCalculated={setRouteResult}
                mapManagerId={mapManagerId === '' ? undefined : mapManagerId}
                defaultName={`Trajeto ${module} #${referenceId}`}
                onSaved={(routeId) => linkSavedRoute(routeId)}
                disabled={busy || mapManagerId === ''}
              />
              {mapManagerId === '' && (
                <div className="small text-body-secondary mt-2">Escolha o mapa para habilitar o cálculo.</div>
              )}
            </>
          )}

          {error && (
            <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="col-lg-7">
          <MapView
            height={460}
            markers={markers}
            routes={lines}
            {...(clickable ? { onMapClick: handleMapClick } : {})}
          />
          {clickable && <div className="small text-body-secondary mt-1">Clique no mapa para marcar o local.</div>}
        </div>
      </div>
    </Modal>
  );
}
