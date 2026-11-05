/**
 * =========================================================================
 * FILE HEADER — services/v1/eleicoes2026.view.ts
 * =========================================================================
 *
 * PROPOSITO: recursos REST SOMENTE LEITURA do dominio Eleicoes2026 (votos do
 * candidato 22001, RJ). Espelho de app/Config/Routes/Api/v1/Eleicoes2026/:
 *   - Candidato22001/EndPointView.php          (secao a secao, com local de votacao)
 *   - Candidato22001Municipio/EndPointView.php (soma por municipio e cargo)
 *   - Candidato22001Bairro/EndPointView.php    (soma por municipio, bairro e cargo)
 * Acesso: admin logado ou token especial das Eleicoes (eleicoes2026.public.ts); sem nenhum dos dois a API responde 401/403.
 *
 * CONSUMIDORES: pages/v1/svg-2026 (mapa Eleicoes 2026). Reexportado por
 * services/v1/index.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** View secao a secao (local, endereco, zona, secao, votos). */
export const eleicoes2026Candidato22001View = createResource(API_GROUPS.eleicoes2026Candidato22001View, 'v1', {
  mutations: false,
});

/** View agregada por municipio e cargo. */
export const eleicoes2026Candidato22001MunicipioView = createResource(
  API_GROUPS.eleicoes2026Candidato22001MunicipioView,
  'v1',
  { mutations: false },
);

/** View agregada por municipio, bairro e cargo. */
export const eleicoes2026Candidato22001BairroView = createResource(
  API_GROUPS.eleicoes2026Candidato22001BairroView,
  'v1',
  { mutations: false },
);
