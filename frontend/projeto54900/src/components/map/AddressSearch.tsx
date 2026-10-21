/**
 * =========================================================================
 * FILE HEADER — components/map/AddressSearch.tsx
 * =========================================================================
 *
 * PROPOSITO: busca de endereco ou nome de rua (Nominatim, pelo proxy
 * map-geo/search). Mostra a lista de resultados; ao escolher um, chama
 * `onSelect(address)` com o endereco ja normalizado (colunas de map_addresses).
 *
 *   <AddressSearch onSelect={(a) => setChosen(a)} />
 *
 * PROPS: `onSelect` (obrigatoria), `country` (padrao do servidor: 'br'; 'xx' =
 * mundo), `disabled`. O campo de texto e do FormGrid (regra do projeto).
 * O servidor limita 30 consultas/min por usuario e usa cache; erro vira alerta.
 * -------------------------------------------------------------------------
 */

import { useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import { mapGeo } from '@/services/v1';
import type { GeoAddress, LatLng } from '@/types/map';
import { errorText } from '@/utils/mapLinks';
import { distanceKm } from '@/utils/mapRegion';

export interface AddressSearchProps {
  onSelect: (address: GeoAddress) => void;
  country?: string | undefined;
  /** Caixa "left,top,right,bottom" (lng,lat) que prioriza os resultados. */
  viewbox?: string | undefined;
  disabled?: boolean | undefined;
  /** Rotulo e nome do campo (padrao: busca de endereco; mude ao usar 2+ instancias na tela). */
  label?: string | undefined;
  fieldName?: string | undefined;
  placeholder?: string | undefined;
  /** Lupa dentro do campo (addon do FormGrid), sem o botao "Buscar endereço" abaixo. */
  compact?: boolean | undefined;
  /** Posicao do usuario: mostra a distancia de cada resultado. */
  origin?: LatLng | undefined;
}

export default function AddressSearch({
  onSelect,
  country,
  viewbox,
  disabled = false,
  label = 'Endereço ou nome da rua',
  fieldName = 'address_query',
  placeholder = 'Ex.: Praça Mauá, Rio de Janeiro',
  compact = false,
  origin,
}: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<GeoAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const searchRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const canSearch = query.trim().length >= 3 && !loading && !disabled;

  const schema = useMemo<FormGridSchema>(
    () => ({
      rows: [
        {
          fields: [
            {
              col: 12,
              label,
              name: fieldName,
              placeholder,
              value: query,
              disabled,
              ...(compact
                ? { addon: { icon: 'bi-search', onClick: () => void searchRef.current(), label: 'Buscar endereço', disabled: !canSearch, loading } }
                : {}),
              onChange: (e) => setQuery(e.target.value),
            },
          ],
        },
      ],
    }),
    [query, disabled, label, fieldName, placeholder, compact, canSearch, loading],
  );


  // Enter no campo busca (e nao envia o formulario externo, se houver).
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    void handleSearch();
  }

  async function handleSearch() {
    if (!canSearch) return;

    setLoading(true);
    setError(null);
    try {
      const result = await mapGeo.search(query.trim(), { limit: 6, ...(country ? { country } : {}), ...(viewbox ? { viewbox } : {}) });
      setItems(result.items);
      setSearched(true);
    } catch (e) {
      setItems([]);
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }

  // O schema (useMemo) chama sempre a versao mais recente da busca, sem refazer o schema a cada digitacao.
  searchRef.current = handleSearch;

  return (
    <div>
      {/* div, nao <form>: este componente fica dentro de outros formularios (form aninhado nao existe no HTML). */}
      <div onKeyDown={handleKeyDown}>
        {compact ? (
          <FormGrid schema={schema} />
        ) : (
          <>
            <FormGrid schema={schema} />
            <button type="button" className="btn btn-primary btn-sm mt-2" disabled={!canSearch} onClick={() => void handleSearch()}>
              {loading ? (
                <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />
              ) : (
                <i className="bi bi-search me-1" aria-hidden="true" />
              )}
              Buscar endereço
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">
          {error}
        </div>
      )}

      {searched && !error && items.length === 0 && (
        <div className="text-body-secondary small mt-3">Nenhum endereço encontrado.</div>
      )}

      {items.length > 0 && (
        <div className="list-group mt-3">
          {items.map((item, index) => (
            <button
              key={`${item.osm_type ?? 'x'}-${item.osm_id ?? index}`}
              type="button"
              className="list-group-item list-group-item-action"
              onClick={() => onSelect(item)}
            >
              <div className="fw-semibold">{item.display_name}</div>
              <div className="small text-body-secondary">
                {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                {item.cep ? ` · CEP ${item.cep}` : ''}
                {origin ? ` · a ${Math.round(distanceKm(origin, { lat: item.lat, lng: item.lng })).toLocaleString('pt-BR')} km de você` : ''}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
