/**
 * =========================================================================
 * FILE HEADER — components/map/RoutePlanner.tsx
 * =========================================================================
 *
 * PROPOSITO: planejador de trajeto controlado por props. Lista as paradas
 * (reordenar/remover), escolhe o perfil (carro, caminhao, bicicleta, a pe) e
 * calcula pelo proxy map-geo/route (OpenRouteService): distancia e tempo total
 * e por trecho. Quem adiciona paradas (clique no mapa, busca de endereco...) e o
 * componente pai; o resultado volta em `onCalculated`.
 *
 *   <RoutePlanner stops={stops} onStopsChange={setStops} profile={p}
 *                 onProfileChange={setP} onCalculated={setResult}
 *                 mapManagerId={3} defaultName="Entrega #12" onSaved={...} />
 *
 * GRAVAR: com `mapManagerId`, aparece o nome do trajeto e o botao "Calcular e
 * gravar", que envia `save` ao proxy (map_routes + map_route_stops numa
 * transacao) e chama `onSaved(routeId, result)`.
 *
 * O resultado so e exibido enquanto paradas e perfil nao mudaram desde o calculo.
 * Sem ORS_API_KEY no servidor o proxy responde 503 e a mensagem aparece aqui.
 * -------------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import { mapGeo } from '@/services/v1';
import type { GeoRouteResult, LatLng, RouteProfile } from '@/types/map';
import { ROUTE_PROFILES, formatDistance, formatDuration } from '@/types/map';
import { errorText } from '@/utils/mapLinks';

export interface PlannerStop {
  id: string;
  label: string;
  position: LatLng;
}

export interface RoutePlannerProps {
  stops: PlannerStop[];
  onStopsChange: (stops: PlannerStop[]) => void;
  profile: RouteProfile;
  onProfileChange: (profile: RouteProfile) => void;
  onCalculated?: ((result: GeoRouteResult | null) => void) | undefined;
  /** Com id de mapa, permite gravar o trajeto (map_routes + paradas). */
  mapManagerId?: number | string | undefined;
  defaultName?: string | undefined;
  onSaved?: ((routeId: number, result: GeoRouteResult) => void) | undefined;
  disabled?: boolean | undefined;
}

export default function RoutePlanner({
  stops,
  onStopsChange,
  profile,
  onProfileChange,
  onCalculated,
  mapManagerId,
  defaultName,
  onSaved,
  disabled = false,
}: RoutePlannerProps) {
  const [name, setName] = useState(defaultName ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeoRouteResult | null>(null);
  const [resultKey, setResultKey] = useState('');

  const currentKey = useMemo(
    () => profile + '|' + stops.map((s) => `${s.position.lat},${s.position.lng}`).join(';'),
    [profile, stops],
  );

  // Paradas ou perfil mudaram: o resultado antigo deixa de valer.
  useEffect(() => {
    if (result !== null && resultKey !== currentKey) {
      setResult(null);
      onCalculated?.(null);
    }
  }, [currentKey, result, resultKey, onCalculated]);

  const schema = useMemo<FormGridSchema>(
    () => ({
      rows: [
        {
          fields: [
            {
              type: 'select',
              col: mapManagerId !== undefined ? 5 : 12,
              label: 'Meio de deslocamento',
              name: 'route_profile',
              options: ROUTE_PROFILES.map((p) => ({ value: p.value, label: p.label })),
              valueKey: 'value',
              labelKey: 'label',
              value: profile,
              disabled,
              onChange: (value: string) => {
                const next = ROUTE_PROFILES.find((p) => p.value === value);
                if (next) onProfileChange(next.value);
              },
            },
            ...(mapManagerId !== undefined
              ? [
                  {
                    col: 7 as const,
                    label: 'Nome do trajeto (para gravar)',
                    name: 'route_name',
                    maxLength: 255,
                    value: name,
                    disabled,
                    onChange: (e: { target: { value: string } }) => setName(e.target.value),
                  },
                ]
              : []),
          ],
        },
      ],
    }),
    [profile, name, disabled, mapManagerId, onProfileChange],
  );

  const canCalculate = stops.length >= 2 && !loading && !disabled;
  const canSave = canCalculate && mapManagerId !== undefined && name.trim() !== '';

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= stops.length) return;
    const next = [...stops];
    const [item] = next.splice(index, 1);
    if (item === undefined) return;
    next.splice(target, 0, item);
    onStopsChange(next);
  }

  function remove(index: number) {
    onStopsChange(stops.filter((_, i) => i !== index));
  }

  async function calculate(save: boolean) {
    setLoading(true);
    setError(null);
    try {
      const computed = await mapGeo.route({
        profile,
        coordinates: stops.map((s): [number, number] => [s.position.lng, s.position.lat]),
        ...(save && mapManagerId !== undefined
          ? {
              save: { map_manager_id: Number(mapManagerId), name: name.trim() },
              stops: stops.map((s) => ({ label: s.label.slice(0, 255) })),
            }
          : {}),
      });
      setResult(computed);
      setResultKey(currentKey);
      onCalculated?.(computed);
      if (save && computed.saved) onSaved?.(computed.saved.route_id, computed);
    } catch (e) {
      setResult(null);
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <FormGrid schema={schema} />

      <div className="mt-3">
        <div className="fw-semibold small mb-1">Paradas ({stops.length})</div>
        {stops.length === 0 ? (
          <div className="text-body-secondary small">
            Clique no mapa ou busque um endereço para adicionar paradas (mínimo 2).
          </div>
        ) : (
          <ol className="list-group list-group-numbered">
            {stops.map((stop, index) => (
              <li key={stop.id} className="list-group-item d-flex align-items-center gap-2 py-1">
                <span className="flex-grow-1 text-truncate" title={stop.label}>
                  {stop.label}
                  <span className="text-body-secondary small ms-1">
                    ({stop.position.lat.toFixed(4)}, {stop.position.lng.toFixed(4)})
                  </span>
                </span>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  aria-label="Subir parada"
                  disabled={disabled || index === 0}
                  onClick={() => move(index, -1)}
                >
                  <i className="bi bi-arrow-up" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  aria-label="Descer parada"
                  disabled={disabled || index === stops.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <i className="bi bi-arrow-down" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  aria-label="Remover parada"
                  disabled={disabled}
                  onClick={() => remove(index)}
                >
                  <i className="bi bi-x-lg" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="d-flex flex-wrap gap-2 mt-3">
        <button type="button" className="btn btn-primary btn-sm" disabled={!canCalculate} onClick={() => void calculate(false)}>
          {loading ? (
            <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />
          ) : (
            <i className="bi bi-signpost-split me-1" aria-hidden="true" />
          )}
          Calcular trajeto
        </button>
        {mapManagerId !== undefined && (
          <button type="button" className="btn btn-success btn-sm" disabled={!canSave} onClick={() => void calculate(true)}>
            <i className="bi bi-save me-1" aria-hidden="true" />
            Calcular e gravar
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">
          {error}
        </div>
      )}

      {result && resultKey === currentKey && (
        <div className="alert alert-info mt-3 mb-0" role="status">
          <div className="fw-semibold">
            <i className="bi bi-clock me-1" aria-hidden="true" />
            {formatDuration(result.duration_s)} · {formatDistance(result.distance_m)}
            {result.cached ? <span className="badge text-bg-secondary ms-2">cache</span> : null}
            {result.saved ? <span className="badge text-bg-success ms-2">gravado</span> : null}
          </div>
          {result.legs.length > 0 && (
            <ul className="list-unstyled small mb-0 mt-2">
              {result.legs.map((leg, i) => (
                <li key={i}>
                  {stops[i]?.label ?? `Parada ${i + 1}`} → {stops[i + 1]?.label ?? `Parada ${i + 2}`}:{' '}
                  {formatDuration(leg.duration_s)} ({formatDistance(leg.distance_m)})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
