/**
 * =============================================================================
 * FILE HEADER — LoginPage (autenticação: entrada na aplicação)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Página `/v1/login`: dois campos fixos (usuário e senha) que autenticam o
 *   usuário e, em caso de sucesso, levam para a home. É a ÚNICA tela do módulo
 *   Auth — `refresh`/`logout`/`me` não têm página, são chamados pelo
 *   `AuthContext`.
 *
 * EXCEÇÃO DELIBERADA AO PADRÃO DE FORMULÁRIO DO PROJETO:
 *   todo formulário "de negócio" deste frontend é montado por SCHEMA, via
 *   `<FormGrid>` (ver `src/markdown/geral/README_render_via_formgrid.md`),
 *   porque a definição mora no banco e é editável no Construtor. Login NÃO é
 *   isso: nenhuma `form_manager` descreve autenticação e ninguém vai configurar
 *   o formulário de login na tela do construtor. Por isso aqui os dois campos
 *   são HTML/Bootstrap de verdade, controlados por estado React. Não "migre"
 *   esta página para `<FormGrid>` sem uma decisão explícita de produto.
 *
 * FLUXO (do clique até a sessão existir):
 *   <form onSubmit> -> `handleSubmit` (BLOCO 2)
 *     +-- validação manual (`checkValidity`/`reportValidity`)
 *          +-- `login(username, password)` — do `useAuth()` (BLOCO 1)
 *               +-- `authService.login` -> POST `/{version}/auth/login`
 *                    +-- `AuthContext` guarda `access_token` (memória) e
 *                        `refresh_token` (sessionStorage) e publica `user`
 *                         +-- `toast.success` + `navigate(paths.home)`
 *   Falha em qualquer ponto do `login` vira toast; `submitting` (BLOCO 1)
 *   desabilita o botão enquanto a requisição está no ar.
 *
 * CONTRATO COM O `AuthContext` (e o que esta página NÃO faz):
 *   - não guarda token, não chama `authService` e não decide onde a sessão
 *     fica: isso é do `AuthProvider` (`@/context/AuthContext`);
 *   - não verifica se o usuário JÁ está logado. O contexto publica `user`,
 *     `isAuthenticated` e `bootstrapping`; hoje só o `Navbar` os consome
 *     (oculta "Entrar" e mostra "Sair", que chama `logout()`) — não há guarda
 *     de rota. Consequência prática: ao evoluir autenticação, o trabalho tende
 *     a começar no contexto/rotas (guarda de rota), não aqui.
 *
 * DEPENDÊNCIAS (arquivos deste projeto que esta página consome):
 *   - `@/context/AuthContext` (`useAuth`) — a única fonte de `login`.
 *   - `react-router-dom` — `useNavigate` (ir para a home) e `Link` (cadastro).
 *   - `@/routes/paths` — `paths.home` e `paths.v1.user.create`.
 *   - `@/hooks/useToast` — feedback de sucesso/erro (nunca `alert`).
 *   - `@/services/http` (`ApiError`) — o erro tipado da API vira mensagem.
 *   - `@/components/global/PageHeader` — título/subtítulo da tela.
 *
 * CONSUMIDORES:
 *   - `src/routes/v1/auth.routes.tsx` -> `{ path: 'login' }` (lazy). É o ÚNICO
 *     consumidor; a página só exporta o default.
 *
 * COMO REPLICAR UMA TELA DE FORMULÁRIO FIXO (sem schema):
 *   1. Estado controlado por campo (`useState`) — aqui `username`/`password`.
 *   2. `<form onSubmit>` com `noValidate` e validação EXPLÍCITA no handler —
 *      o padrão do projeto para telas que não passam pelo `FormGrid`.
 *   3. Um `submitting` que desabilita o botão e troca o rótulo.
 *   4. Erro sempre em `toast` (`ApiError.message` quando houver).
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. `noValidate` no `<form>` desliga a validação nativa do browser; quem
 *      valida é o handler (`if (!el.checkValidity()) { el.reportValidity(); return; }`).
 *      Tirar o `noValidate` faria as duas validações competirem.
 *   2. Os `autoComplete` (`username`/`current-password`) são o que permite ao
 *      gerenciador de senhas preencher — não troque por valores arbitrários.
 *   3. O sucesso navega para `paths.home` (destino fixo): não há retorno à rota
 *      que o usuário tentou acessar antes do login.
 *   4. `useCallback` com `[login, username, password, toast, navigate]`: o
 *      handler é recriado a cada tecla (o valor dos campos está na dependência).
 * =============================================================================
 */

import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { paths } from '@/routes/paths';

/**
 * =============================================================================
 * BLOCO 1 — HOOKS DE INFRAESTRUTURA E ESTADO
 * =============================================================================
 *
 * HOOKS (tudo vem de fora — a página não tem lógica própria de autenticação):
 *   `useAuth()`     -> `login(username, password)`: chama a API, guarda os
 *                     tokens e publica o usuário no contexto. É a única coisa
 *                     que esta tela precisa saber sobre autenticação.
 *   `useNavigate()` -> navegação imperativa (usada depois do login).
 *   `useToast()`    -> feedback de sucesso/erro.
 *
 * ESTADO (só 3 peças, todas locais):
 *   `username`   texto do campo "Usuário"
 *   `password`   texto do campo "Senha"
 *   `submitting` `true` enquanto a requisição de login está no ar: desabilita o
 *                botão e troca o rótulo para "Entrando..." (evita duplo clique)
 *
 * POR QUE OS CAMPOS SÃO CONTROLADOS (`value` + `onChange`):
 *   porque o projeto não usa `<FormGrid>` aqui (ver EXCEÇÃO no header) — sem
 *   schema, quem manda no DOM é o estado React. É o mesmo padrão de "formulário
 *   fixo" usado nas telas de infraestrutura (ex.: cadastro/perfil).
 *
 * NÃO EXISTE ESTADO DE ERRO: a falha vai direto para o `toast` (BLOCO 2),
 *   então não há mensagem para guardar e renderizar na tela.
 * -------------------------------------------------------------------------
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Campos controlados (ver BLOCO 1) + o "enviando" que trava o botão.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /**
   * =============================================================================
   * BLOCO 2 — HANDLER DE SUBMIT (validar -> logar -> navegar)
   * =============================================================================
   *
   * O QUE FAZ, na ordem:
   *   1. `preventDefault()` — o envio é via fetch, a página não navega sozinha.
   *   2. VALIDAÇÃO MANUAL: o `<form>` tem `noValidate` (desliga a validação
   *      nativa), então o handler pergunta ao próprio formulário
   *      (`el.checkValidity()`) e, se algum `required` estiver vazio, manda o
   *      browser mostrar o balão (`el.reportValidity()`) e para. Sem este par, o
   *      envio vazio chegaria à API e o usuário veria erro de credencial em vez
   *      do aviso no campo.
   *   3. `submitting = true` ANTES do `await` (o botão trava na hora).
   *   4. `await login(username, password)` — o `AuthContext` faz a chamada,
   *      guarda os tokens e publica o usuário; aqui só se espera terminar.
   *   5. SUCESSO: toast de boas-vindas e `navigate(paths.home)`. O `void` marca
   *      que a promise da navegação é intencionalmente não aguardada.
   *   6. ERRO: `ApiError` traz a mensagem de negócio (credencial inválida, conta
   *      bloqueada...); qualquer outra exceção cai na genérica. É sempre
   *      `toast`, nunca texto solto na tela.
   *   7. `finally`: `submitting = false` — sem isso o botão ficaria travado
   *      depois de uma falha.
   *
   * MANUTENÇÃO: como `username`/`password` estão nas dependências do
   *   `useCallback`, o handler é recriado a cada tecla digitada. É inofensivo
   *   (nenhum efeito depende dele), mas vale lembrar se ele crescer.
   * -------------------------------------------------------------------------
   */
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }

      setSubmitting(true);
      try {
        // O `AuthContext` faz a chamada, guarda os tokens e publica o usuário.
        await login(username, password);
        toast.success('Login realizado com sucesso.', { title: 'Bem-vindo' });
        // Destino fixo (paths.home) — não há retorno à rota tentada antes do login.
        void navigate(paths.home);
      } catch (err) {
        // `ApiError` = erro de negócio devolvido pela API; qualquer outra exceção
        // (rede/timeout) cai na mensagem genérica.
        const message = err instanceof ApiError ? err.message : 'Falha inesperada ao entrar.';
        toast.error(message, { title: 'Erro ao entrar' });
      } finally {
        setSubmitting(false);
      }
    },
    [login, username, password, toast, navigate],
  );

  /**
   * =============================================================================
   * BLOCO 3 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ:
   *   1. `<PageHeader>` — título "Entrar" + subtítulo dizendo de onde vem o
   *      usuário (o criado no cadastro).
   *   2. Card CENTRALIZADO: `row justify-content-center` + `col-12 col-sm-8
   *      col-md-6 col-lg-4` — largura total no celular, estreitando e
   *      centralizando a partir de `sm`. É o layout padrão de tela de entrada;
   *      não há CSS próprio.
   *   3. Os dois `<input>` CONTROLADOS (BLOCO 1), com `<label htmlFor>` ligado ao
   *      `id` do campo, `required` (é o que o `checkValidity()` do BLOCO 2
   *      enxerga) e `autoComplete` correto para o gerenciador de senhas.
   *   4. Botão de submit com `w-100`, que vira "Entrando..." e desabilita quando
   *      `submitting`.
   *   5. Link "Criar conta" -> `/v1/user-manager/create` (módulo user, etapa 1
   *      do cadastro), o outro caminho de entrada do sistema.
   *
   * COMO REAPROVEITAR: mantendo `<label htmlFor>` ligado ao `id` e `required`, a
   *   validação do BLOCO 2 continua valendo. Ao acrescentar um campo, crie o
   *   estado no BLOCO 1 e inclua o valor na chamada de `login`.
   * -------------------------------------------------------------------------
   */
  return (
    <>
      {/* 1. Cabeçalho: título/subtítulo fixos (não vêm de definição). */}
      <PageHeader title="Entrar" subtitle="Acesse com o usuário criado no cadastro" />

      {/* 2. Card centralizado e responsivo (sem CSS próprio). */}
      <div className="row justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {/* 3. Campos controlados — sem FormGrid aqui (ver EXCEÇÃO no header). */}
              <form onSubmit={(e) => void handleSubmit(e)} noValidate>
                <div className="mb-3">
                  <label htmlFor="login-username" className="form-label">
                    Usuário
                  </label>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    className="form-control"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="login-password" className="form-label">
                    Senha
                  </label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    className="form-control"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {/* 4. `w-100` + disabled/spinner textual enquanto `submitting`. */}
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            </div>
          </div>

          {/* 5. Caminho alternativo: cadastro no módulo user. */}
          <p className="text-center text-body-secondary mt-3">
            Não tem conta?{' '}
            <Link to={paths.v1.user.create}>Criar conta</Link>
          </p>
        </div>
      </div>
    </>
  );
}
