/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/registry.ts
 * =========================================================================
 *
 * PROPOSITO: ponto UNICO que liga a slug de um formulario (`fm_slug`,
 * mesma da rota `/v1/form/:slug`) ao script de preenchimento fake daquele
 * formulario. E o que permite `components/global/FakeFillButton.tsx`
 * continuar generico: ele so pergunta "existe script para esta slug?".
 *
 * DEV-ONLY: nada aqui verifica isDevHost() — quem decide se o botao (e,
 * portanto, se algum destes scripts roda) aparece e o FakeFillButton.
 *
 * CONSUMIDORES: components/global/FakeFillButton.tsx.
 *
 * COMO REGISTRAR O PROXIMO FORMULARIO: criar
 * `dev/fakeFill/<slug-em-camelCase>.ts` (mesmo padrao de `calendario.ts` —
 * regras de negocio confirmadas pela API/Model/Processor, nunca advinhadas)
 * e acrescentar uma linha no mapa abaixo com a MESMA slug usada na rota
 * `/v1/form/<slug>`.
 * -------------------------------------------------------------------------
 */

import { fillCalendarioForm } from './calendario';
import { fillCadastroEventoForm } from './cadastroEvento';
import { fillDadosDoUsuarioForm } from './dadosDoUsuario';
import { fillProdutoCirurgicoForm } from './produtoCirurgico';
import { fillServicoVariadoForm } from './servicoVariado';
import { fillTimelinePostForm } from './timelinePost';
import { fillTimelineCommentForm } from './timelineComment';
import { fillTimelineReportForm } from './timelineReport';
import {
  fillCategoriaMapaForm,
  fillCepMapaForm,
  fillEnderecoMapaForm,
  fillIconeMapaForm,
  fillMapaForm,
  fillParadaTrajetoForm,
  fillPontoMapaForm,
  fillVinculoMapaForm,
} from './mapa';

type FakeFillFn = () => void | Promise<void>;

export const FAKE_FILL_SCRIPTS: Record<string, FakeFillFn> = {
  calendario: fillCalendarioForm,
  'cadastro-evento': fillCadastroEventoForm,
  'dados-do-usuario': fillDadosDoUsuarioForm,
  'timeline-post': fillTimelinePostForm,
  'timeline-comment': fillTimelineCommentForm,
  'timeline-report': fillTimelineReportForm,
  // Map (administrativo): so os formularios de cadastro.
  'criar-mapa': fillMapaForm,
  'criar-icone-mapa': fillIconeMapaForm,
  'criar-categoria-mapa': fillCategoriaMapaForm,
  'criar-cep-mapa': fillCepMapaForm,
  'criar-endereco-mapa': fillEnderecoMapaForm,
  'criar-ponto-mapa': fillPontoMapaForm,
  'criar-parada-trajeto': fillParadaTrajetoForm,
  'criar-vinculo-mapa': fillVinculoMapaForm,
  // Produto: cadastro completo (nucleo + caracteristicas) com material para cirurgias.
  'criar-produto': fillProdutoCirurgicoForm,
  // Servico: cadastro completo (nucleo + caracteristicas) com servicos de ramos variados.
  'criar-servico': fillServicoVariadoForm,
};

export function getFakeFillScript(slug: string): FakeFillFn | undefined {
  return FAKE_FILL_SCRIPTS[slug];
}
