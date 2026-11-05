// Dicionario de campos do SGD: junta os JSONs desta pasta em um unico mapa
// `chave do sistema` -> `rotulos aceitos no documento` (sem acento, minusculo; a
// comparacao ignora acento e caixa). Para um campo novo basta editar/criar um JSON
// aqui e importa-lo abaixo — nada mais muda.
//
//   { "name": ["nome", "nome completo"] }
//   "Nome:", "NOME:", "Nome Completo:" no documento  =>  campo `name`.

import type { FieldDictionary, FieldTypes, SectionDictionary } from '@/utils/documentFields';
import type { StructureRules } from '@/utils/documentStructure';

import bancarios from './bancarios.json';
import comunicacao from './comunicacao.json';
import contato from './contato.json';
import contrato from './contrato.json';
import documentos from './documentos.json';
import endereco from './endereco.json';
import identificacao from './identificacao.json';
import nfe from './nfe.json';
import predial from './predial.json';
import processual from './processual.json';
import estrutura from './estrutura.json';
import secoes from './secoes.json';
import tipos from './tipos.json';

const parts: readonly FieldDictionary[] = [identificacao, documentos, contato, endereco, bancarios, nfe, comunicacao, predial, contrato, processual];

// A mesma chave em mais de um JSON soma os rotulos (nunca um arquivo apaga o outro).
const merged: Record<string, string[]> = {};
for (const part of parts) {
  for (const [key, aliases] of Object.entries(part)) merged[key] = [...(merged[key] ?? []), ...aliases];
}

export const sgdDictionary: FieldDictionary = merged;

// `chave -> tipo de valor` (tipos.json): quais campos o OCR costuma errar e como corrigir.
export const sgdTypes: FieldTypes = tipos;

// `prefixo -> titulos de secao` (secoes.json): o mesmo rotulo em blocos diferentes vira `<prefixo>_<chave>`.
export const sgdSections: SectionDictionary = secoes;

// Dados sem rotulo (por forma ou posicao) e texto corrido (estrutura.json).
export const sgdStructure: StructureRules = estrutura;

export default sgdDictionary;
