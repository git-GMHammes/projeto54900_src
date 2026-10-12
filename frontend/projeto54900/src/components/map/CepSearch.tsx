/**
 * =========================================================================
 * FILE HEADER — components/map/CepSearch.tsx
 * =========================================================================
 *
 * PROPOSITO: consulta de CEP com georreferenciamento pelo proxy map-geo/cep
 * (ViaCEP/BrasilAPI para o texto, Nominatim para a coordenada). O servidor ja
 * grava/atualiza map_postal_codes; ao resolver, chama `onResolved(row)` com a
 * linha (tem `id`, usado em map_links.map_postal_code_id).
 *
 *   <CepSearch onResolved={(cep) => setChosen(cep)} />
 *
 * O campo e o `cep` do FormGrid (mascara e validacao padrao do projeto; ele
 * mesmo confirma a existencia do CEP no ViaCEP ao completar 8 digitos).
 * -------------------------------------------------------------------------
 */

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import { mapGeo } from '@/services/v1';
import type { PostalCodeRow } from '@/types/map';
import { toCoord } from '@/types/map';
import { errorText } from '@/utils/mapLinks';

export interface CepSearchProps {
  onResolved: (row: PostalCodeRow) => void;
  disabled?: boolean | undefined;
}

export default function CepSearch({ onResolved, disabled = false }: CepSearchProps) {
  const [cep, setCep] = useState('');
  const [row, setRow] = useState<PostalCodeRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = useMemo<FormGridSchema>(
    () => ({
      rows: [
        {
          fields: [
            {
              type: 'cep',
              col: 6,
              label: 'CEP',
              name: 'cep_query',
              value: cep,
              disabled,
              onChange: (e) => setCep(e.target.value),
            },
          ],
        },
      ],
    }),
    [cep, disabled],
  );

  const canSearch = cep.length === 8 && !loading && !disabled;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSearch) return;

    setLoading(true);
    setError(null);
    try {
      const result = await mapGeo.cep(cep);
      setRow(result.item);
      onResolved(result.item);
    } catch (e) {
      setRow(null);
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }

  const lat = row ? toCoord(row.lat) : null;
  const lng = row ? toCoord(row.lng) : null;

  return (
    <div>
      <form onSubmit={(e) => void handleSubmit(e)} noValidate>
        <FormGrid schema={schema} />
        <button type="submit" className="btn btn-primary btn-sm mt-2" disabled={!canSearch}>
          {loading ? (
            <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />
          ) : (
            <i className="bi bi-mailbox2 me-1" aria-hidden="true" />
          )}
          Buscar CEP
        </button>
      </form>

      {error && (
        <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">
          {error}
        </div>
      )}

      {row && (
        <div className="card card-body py-2 mt-3">
          <div className="fw-semibold">
            {[row.street, row.neighborhood].filter(Boolean).join(' — ') || 'CEP sem logradouro (CEP geral da cidade)'}
          </div>
          <div className="small text-body-secondary">
            {[row.city, row.state].filter(Boolean).join('/')} · CEP {row.cep}
            {lat !== null && lng !== null ? ` · ${lat.toFixed(5)}, ${lng.toFixed(5)}` : ' · sem coordenada'}
          </div>
        </div>
      )}
    </div>
  );
}
