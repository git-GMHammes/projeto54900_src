/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/mapa.ts
 * =========================================================================
 *
 * PROPOSITO: preenche com dados fake VALIDOS os formularios de CADASTRO do
 * administrativo do Map (form_manager `criar-*-mapa`, tabelas map_*). DEV-ONLY —
 * acionado por components/global/FakeFillButton.tsx, que so aparece com isDevHost()
 * e so no cadastro (nao na edicao, para nao sobrescrever um registro existente).
 *
 * IDs USADOS: field_key = nome da coluna (ver doc/sql/insert/20261011172500_map_admin_menu_list_forms.sql).
 *
 * REGRAS DE NEGOCIO RESPEITADAS (Requests/Processors de Map/*):
 *   - slug de Mapa e Categoria NAO e digitado: o formulario o preenche sozinho a partir do
 *     titulo/nome + _AAAAMMDDHHMMSS (RecordFormBuild autoSlug; o backend tambem garante o sufixo).
 *   - lat/lng sempre juntas, dentro de -90..90 e -180..180, com ate 6 casas decimais
 *     (pattern do formulario).
 *   - CEP: 8 digitos aleatorios (unico em map_postal_codes -> sufixo aleatorio evita 409).
 *   - FKs obrigatorias (mapa, trajeto, ponto, endereco...) usam a primeira opcao da
 *     lista (selectFirstComboboxOption); se a tabela referenciada estiver vazia, o
 *     campo fica vazio e o formulario avisa na validacao.
 *   - Ponto/categoria: a categoria do ponto precisa ser do mesmo mapa, por isso o
 *     preenchimento do ponto nao escolhe categoria.
 *   - Vinculo: usa module 'user-manager' (registrado em Config/MapLinkables.php) com o
 *     registro id 1 e o tipo `point`, escolhendo o primeiro ponto cadastrado.
 *
 * DEPENDENCIAS: dev/fakeFill/domUtils. CONSUMIDOR: dev/fakeFill/registry.ts.
 * -------------------------------------------------------------------------
 */

import {
  randomHexColor,
  randomInt,
  randomItem,
  randomSentence,
  randomToken,
  selectComboboxOption,
  selectFirstComboboxOption,
  setReactValue,
} from './domUtils';

interface Cidade {
  nome: string;
  uf: string;
  lat: number;
  lng: number;
}

// Padrao: Rio de Janeiro (coordenada real aproximada do centro). Para testar outra cidade, acrescente aqui.
const CIDADES: readonly Cidade[] = [
  { nome: 'Rio de Janeiro', uf: 'RJ', lat: -22.9068, lng: -43.1729 },
] as const;

const RUAS = ['Avenida Rio Branco', 'Rua do Ouvidor', 'Avenida Atlântica', 'Rua Visconde de Pirajá', 'Praça Mauá', 'Avenida Presidente Vargas', 'Rua da Carioca'] as const;
const BAIRROS = ['Centro', 'Copacabana', 'Ipanema', 'Botafogo', 'Tijuca', 'Lapa', 'Engenho Novo'] as const;
const ICONES = ['bi-geo-alt-fill', 'bi-shop', 'bi-building', 'bi-hospital', 'bi-bus-front', 'bi-tree-fill', 'bi-cup-hot'] as const;
const PALAVRAS = ['ponto', 'de', 'apoio', 'regional', 'atendimento', 'entrega', 'centro', 'logístico', 'equipe', 'rota'] as const;

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) setReactValue(el, value);
}

function digits(length: number): string {
  return Array.from({ length }, () => String(randomInt(0, 9))).join('');
}

/** Coordenada perto do centro da cidade (aprox. 5 km), com 6 casas decimais. */
function near(cidade: Cidade): { lat: string; lng: string } {
  const jitter = (): number => (Math.random() - 0.5) * 0.09;
  return { lat: (cidade.lat + jitter()).toFixed(6), lng: (cidade.lng + jitter()).toFixed(6) };
}

export function fillMapaForm(): void {
  const cidade = randomItem(CIDADES);

  setText('title', `Mapa ${cidade.nome} ${randomToken(4)}`);
  // slug: o formulario o preenche sozinho a partir do titulo (RecordFormBuild autoSlug).
  setText('description', randomSentence(PALAVRAS, 6));
  setText('center_lat', cidade.lat.toFixed(6));
  setText('center_lng', cidade.lng.toFixed(6));
}

export function fillIconeMapaForm(): void {
  setText('name', `Ícone ${randomToken(5)}`);
  setText('icon_class', randomItem(ICONES));
  setText('color', randomHexColor());
}

export async function fillCategoriaMapaForm(): Promise<void> {
  await selectFirstComboboxOption('map_manager_id');
  setText('name', `Categoria ${randomToken(5)}`);
  // slug: o formulario o preenche sozinho a partir do nome (RecordFormBuild autoSlug).
  setText('color', randomHexColor());
  setText('sort_order', String(randomInt(0, 20)));
}

export async function fillCepMapaForm(): Promise<void> {
  const cidade = randomItem(CIDADES);
  const { lat, lng } = near(cidade);

  setText('cep', digits(8));
  setText('street', randomItem(RUAS));
  setText('neighborhood', randomItem(BAIRROS));
  setText('city', cidade.nome);
  setText('state', cidade.uf);
  setText('lat', lat);
  setText('lng', lng);
  await selectComboboxOption('source', 'manual');
}

export function fillEnderecoMapaForm(): void {
  const cidade = randomItem(CIDADES);
  const { lat, lng } = near(cidade);

  setText('cep', digits(8));
  setText('street', randomItem(RUAS));
  setText('number', String(randomInt(1, 2000)));
  setText('neighborhood', randomItem(BAIRROS));
  setText('city', cidade.nome);
  setText('state', cidade.uf);
  setText('lat', lat);
  setText('lng', lng);
}

export async function fillPontoMapaForm(): Promise<void> {
  const cidade = randomItem(CIDADES);
  const { lat, lng } = near(cidade);

  await selectFirstComboboxOption('map_manager_id');
  setText('name', `Ponto ${randomToken(5)}`);
  setText('description', randomSentence(PALAVRAS, 5));
  setText('lat', lat);
  setText('lng', lng);
}

export async function fillParadaTrajetoForm(): Promise<void> {
  const cidade = randomItem(CIDADES);
  const { lat, lng } = near(cidade);

  await selectFirstComboboxOption('map_route_id');
  setText('label', `Parada ${randomToken(4)}`);
  setText('lat', lat);
  setText('lng', lng);
  setText('sort_order', String(randomInt(1, 10)));
}

export async function fillVinculoMapaForm(): Promise<void> {
  setText('module', 'user-manager');
  setText('reference_id', '1');
  setText('collection', `teste-${randomToken(4)}`);
  await selectComboboxOption('link_type', 'point');
  await selectFirstComboboxOption('map_point_id');
}
