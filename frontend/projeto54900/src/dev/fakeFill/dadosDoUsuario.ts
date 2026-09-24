/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/dadosDoUsuario.ts
 * =========================================================================
 *
 * PROPOSITO: preenche com dados fake VALIDOS o formulario `dados-do-usuario`
 * (etapa 2 do cadastro, pages/v1/user/user-profiles/CreatePage.tsx, tabela
 * `user_profiles`). DEV-ONLY — acionado por components/global/FakeFillButton.tsx,
 * que só aparece com isDevHost().
 *
 * IDs USADOS (field_key, confirmados ao vivo via
 * POST /api/v1/form-manager-view/get-grouped?fm_slug=dados-do-usuario):
 *   name (text), cpf (cpf), whatsapp/phone (phone), email (email),
 *   cep (cep), address (text)
 *
 * REGRAS DE NEGOCIO RESPEITADAS (API + Requests/Processor de UserProfiles +
 * componentes do FormGrid):
 *   - `user_manager_id` e `uuid` NAO sao tocados: ambos read-only — o FK vem
 *     da querystring (etapa 1) e sobrescrever trocaria o usuario de origem;
 *     o uuid (hidden) ja e gerado pela propria CreatePage no carregamento.
 *   - `name` obrigatorio, min_length=3 — sempre nome + sobrenome.
 *   - `cpf`: components/ui/FormGrid/cpf confere os 2 digitos verificadores —
 *     randomCpf() calcula os DV com o mesmo algoritmo (cpfValido).
 *   - `whatsapp`/`phone`: components/ui/FormGrid/phone exige DDD de
 *     DDDS_VALIDOS e "9" apos o DDD quando ha 11 digitos. whatsapp sempre
 *     celular (11); phone fixo (10, inicia em 2..5) ou celular.
 *   - `email`: UNIQUE em user_profiles (Processor devolve 409) — sufixo
 *     randomToken() para nunca repetir.
 *   - `cep`: components/ui/FormGrid/cep consulta a ViaCEP e marca CEP
 *     inexistente como invalido — so CEPs reais (conferidos na ViaCEP em
 *     2026-09-24), com o `address` correspondente.
 *   - Campos mascarados (cpf/phone/cep) recebem so digitos no input visivel;
 *     o proprio componente aplica a mascara e emite o hidden.
 *
 * DEPENDENCIAS: dev/fakeFill/domUtils (setReactValue, geradores aleatorios).
 * CONSUMIDORES: dev/fakeFill/registry.ts (entrada 'dados-do-usuario').
 * -------------------------------------------------------------------------
 */

import { randomInt, randomItem, randomToken, setReactValue } from './domUtils';

const NOMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique',
  'Isabela', 'João', 'Larissa', 'Marcos', 'Natália', 'Otávio', 'Paula', 'Rafael',
] as const;

const SOBRENOMES = [
  'Silva', 'Souza', 'Oliveira', 'Santos', 'Pereira', 'Costa', 'Rodrigues',
  'Almeida', 'Nascimento', 'Lima', 'Araújo', 'Ferreira', 'Carvalho', 'Gomes',
] as const;

// Subconjunto de DDDS_VALIDOS (components/ui/FormGrid/phone).
const DDDS = ['11', '19', '21', '24', '27', '31', '41', '48', '51', '61', '71', '81', '85'] as const;

// CEPs reais (conferidos na ViaCEP em 2026-09-24) + logradouro correspondente.
const ENDERECOS = [
  { cep: '01001000', address: 'Praça da Sé, Sé, São Paulo/SP' },
  { cep: '01310100', address: 'Avenida Paulista, Bela Vista, São Paulo/SP' },
  { cep: '20040002', address: 'Avenida Rio Branco, Centro, Rio de Janeiro/RJ' },
  { cep: '22010000', address: 'Avenida Atlântica, Copacabana, Rio de Janeiro/RJ' },
  { cep: '30130010', address: 'Praça Sete de Setembro, Centro, Belo Horizonte/MG' },
  { cep: '80010000', address: 'Rua José Loureiro, Centro, Curitiba/PR' },
  { cep: '90010280', address: 'Rua Duque de Caxias, Centro Histórico, Porto Alegre/RS' },
  { cep: '60060120', address: 'Rua Vinte e Cinco de Março, Centro, Fortaleza/CE' },
] as const;

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) setReactValue(el, value);
}

function randomDigits(length: number): string {
  return Array.from({ length }, () => String(randomInt(0, 9))).join('');
}

/** CPF de 11 dígitos com DV válidos (mesmo cálculo de cpfValido no componente cpf). */
function randomCpf(): string {
  let base = randomDigits(9);
  while (/^(\d)\1{8}$/.test(base)) base = randomDigits(9);

  const dv = (digits: string): number => {
    const peso = digits.length + 1;
    const soma = digits.split('').reduce((acc, d, i) => acc + Number(d) * (peso - i), 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = dv(base);
  const d2 = dv(`${base}${d1}`);
  return `${base}${d1}${d2}`;
}

/** Celular: DDD + 9 + 8 dígitos (11 no total). */
function randomCelular(): string {
  return `${randomItem(DDDS)}9${randomDigits(8)}`;
}

/** Fixo: DDD + [2-5] + 7 dígitos (10 no total). */
function randomFixo(): string {
  return `${randomItem(DDDS)}${randomInt(2, 5)}${randomDigits(7)}`;
}

/** Remove acentos e baixa a caixa — só para montar o local-part do email. */
function slugEmail(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Preenche os campos editáveis de "Usuário (Dados)" (user_manager_id e uuid ficam intocados). */
export function fillDadosDoUsuarioForm(): void {
  const nome = randomItem(NOMES);
  const sobrenome = randomItem(SOBRENOMES);
  const endereco = randomItem(ENDERECOS);

  setText('name', `${nome} ${sobrenome}`);
  setText('cpf', randomCpf());
  setText('whatsapp', randomCelular());
  setText('phone', Math.random() < 0.5 ? randomFixo() : randomCelular());
  setText('email', `${slugEmail(nome)}.${slugEmail(sobrenome)}.${randomToken(5)}@exemplo.com.br`);
  setText('cep', endereco.cep);
  setText('address', `${endereco.address}, ${randomInt(1, 2000)}`);
}

export default fillDadosDoUsuarioForm;
