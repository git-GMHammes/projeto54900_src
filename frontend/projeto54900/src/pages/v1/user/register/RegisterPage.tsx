/**
 * =========================================================================
 * FILE HEADER — RegisterPage.tsx
 * =========================================================================
 *
 * O QUE FAZ: pagina de "Novo Cadastro" publica (rota /v1/user/register, ver
 * routes/v1/user.routes.tsx). E um wizard em 2 cards sequenciais (nao
 * abas) — um card por TABELA do banco, ligados por chave estrangeira:
 *
 *   1. Login    -> form ativo da tabela user_manager, INTEIRO: username +
 *                  password_hash juntos, como configurado no FormBuilderPage.
 *                  Grava de verdade (POST) e guarda o id retornado.
 *   2. Cadastro -> form ativo da tabela user_profiles, INTEIRO. So aparece
 *                  depois do login confirmado. O campo user_manager_id (FK)
 *                  vem pre-preenchido com o id do passo 1 e read-only NESTA
 *                  TELA (o build em si continua exatamente como configurado
 *                  no construtor — visivel, sem hidden/collapse).
 *
 * Cada card usa o form_manager ATIVO cuja fm_table_name seja a tabela da
 * etapa — nunca um slug/ID fixo, para nao depender de quem montou o build
 * nem de qual banco/maquina (ver loadFormByTable() abaixo). Nao dividimos
 * campos de um MESMO build entre cards: cada card e um build completo; as
 * etapas existem para encadear tabelas diferentes, nao para fatiar um
 * formulario so.
 *
 * Fica em pasta propria (register/) dentro do modulo user porque e um fluxo
 * composto entre 2 recursos (user-manager + user-profiles), nao a acao de
 * uma tabela so (ver README_paginas_modulo.md).
 *
 * DEPENDENCIAS (arquivos proprios do projeto):
 *   - components/ui/FormGrid/Input (FormGrid + FormGridSchema): renderiza
 *     o schema de cada form ativo como inputs de verdade.
 *   - components/global/PageHeader, EmptyState, LoadingOverlay: casca
 *     visual padrao (titulo, estado vazio/erro, overlay de carregamento).
 *   - hooks/useToast: feedback de sucesso/erro apos cada submit.
 *   - services/http (ApiError): erro tipado vindo da API.
 *   - services/v1 (formManagerView): leitura agrupada do form_manager
 *     ativo por tabela.
 *   - services/formSchema (buildRenderSchema, RenderForm): converte as
 *     linhas cruas do form_manager num schema pronto para o FormGrid.
 *   - utils/apiResult (normalizeList, normalizeItem): extraem os dados
 *     uteis das respostas variadas da API.
 *   - utils/formSubmit (formDataToPayload, errorDetail, resolveEndpoint,
 *     senderFor): montam o payload do form e escolhem o metodo/URL de
 *     envio a partir do meta do form ativo.
 *   - routes/paths: caminhos centralizados (Voltar, Entrar agora).
 *
 * CONSUMIDORES: routes/v1/user.routes.tsx registra esta pagina na rota
 * "register" (carregada via lazy import), montando /v1/user/register.
 *
 * COMO CRIAR UMA PAGINA WIZARD SIMILAR (N tabelas encadeadas por FK):
 *   1. Definir as constantes de tabela (TABLE_*) e o(s) nome(s) do campo FK.
 *   2. Reaproveitar loadFormByTable() por tabela (ou generalizar para uma
 *      lista) para buscar o form ativo de cada etapa via formManagerView.
 *   3. Guardar em estado o id retornado por cada submit anterior e usar
 *      uma funcao como prefillFkField() para pre-preencher a FK do proximo
 *      card, travando o campo com readOnly nesta tela (nao no build).
 *   4. Um handler de submit por card, seguindo o mesmo fluxo: valida o
 *      form nativo, monta o payload com formDataToPayload(), envia com
 *      senderFor()/resolveEndpoint(), normaliza a resposta, dispara toast
 *      de sucesso/erro e atualiza estado.
 *   5. No JSX, renderizar os cards em sequencia, cada um condicionado ao
 *      estado (id) do card anterior ter sido criado.
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

/**
 * =========================================================================
 * BLOCO 1 — CONSTANTES DE MODULO
 * =========================================================================
 *
 * O QUE FAZ: identificam as tabelas de cada etapa do wizard e o nome do
 * campo FK que liga a segunda etapa a primeira.
 * POR QUE E IMPORTANTE: a resolucao do form ativo e por TABELA
 * (fm_table_name, fonte de verdade gravada na criacao do form_manager) e
 * status ativo — nunca por slug/ID de quem construiu o formulario. Assim a
 * tela funciona em qualquer maquina/banco, desde que exista 1 form ativo
 * publicado para cada tabela do modulo (ver README_form_constructor.md).
 * CONEXAO: usadas por loadFormByTable() (carregamento) e por
 * prefillFkField() (pre-preenchimento da FK no card 2).
 * -------------------------------------------------------------------------
 */
const TABLE_MANAGER = 'user_manager';
const TABLE_PROFILE = 'user_profiles';
const FK_FIELD = 'user_manager_id';

/**
 * =========================================================================
 * BLOCO 2 — FUNCOES AUXILIARES (fora do componente)
 * =========================================================================
 *
 * O QUE FAZ: carregam e validam o form ativo de uma tabela
 * (loadFormByTable), apoiadas por um helper de deduplicacao de ids
 * (distinctManagerIds), e pre-preenchem/travam o campo FK do card 2 com o
 * id criado no card 1 (prefillFkField). Sao funcoes puras/assincronas sem
 * estado de React — podem ser reaproveitadas fora deste componente.
 * CONEXAO: loadFormByTable() chama services/v1 (formManagerView.getGrouped)
 * e services/formSchema (buildRenderSchema); prefillFkField() opera sobre o
 * FormGridSchema que sera passado ao FormGrid.
 * COMO REAPROVEITAR EM OUTRA PAGINA: chamar loadFormByTable(tabela, label)
 * para cada etapa do wizard e prefillFkField(schema, nomeDoCampoFk, valor)
 * sempre que uma etapa precisar herdar o id de uma etapa anterior.
 * -------------------------------------------------------------------------
 */

interface LoadFormResult {
  form: RenderForm | null;
  /** null = ok; string = motivo (indisponivel ou duplicidade). */
  error: string | null;
}

/**
 * Extrai os ids distintos de form_manager (fm_id) presentes nas linhas
 * retornadas pela API, ignorando valores invalidos ou ausentes.
 * @param rows linhas cruas de form_manager + form_columns agrupadas por form
 * @returns lista de ids numericos unicos, na ordem de primeira ocorrencia
 */
function distinctManagerIds(rows: readonly ApiRow[]): number[] {
  const ids = new Set<number>();
  for (const row of rows) {
    const v = row.fm_id;
    const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
    if (Number.isFinite(n)) ids.add(n);
  }
  return [...ids];
}

/**
 * Busca o form_manager ATIVO de uma tabela e converte suas linhas no
 * RenderForm pronto para o FormGrid. Garante que exista exatamente um form
 * ativo publicado para a tabela — nenhum ou mais de um vira uma mensagem de
 * erro amigavel, exibida na tela via EmptyState (ver JSX no final do
 * arquivo).
 * @param tableName valor de fm_table_name a filtrar (ex.: 'user_manager')
 * @param label rotulo humano da etapa, usado nas mensagens de erro
 * @returns { form, error }; form so vem preenchido quando error e null
 */
async function loadFormByTable(tableName: string, label: string): Promise<LoadFormResult> {
  const raw = await formManagerView.getGrouped(
    { fm_table_name: [tableName], fm_status: ['active'] },
    { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
  );
  const { rows } = normalizeList(raw);
  const ids = distinctManagerIds(rows);

  if (ids.length === 0) {
    return { form: null, error: `Nenhum formulario ativo publicado para ${label} (tabela ${tableName}).` };
  }
  if (ids.length > 1) {
    return {
      form: null,
      error: `Ha ${ids.length} formularios ativos para ${label} (tabela ${tableName}) — deixe apenas um publicado.`,
    };
  }
  const form = buildRenderSchema(rows);
  if (!form) {
    return {
      form: null,
      error:
        `Formulario ativo de ${label} (tabela ${tableName}) nao tem nenhum campo configurado. ` +
        'Verifique se todos os campos foram adicionados nas linhas do formulario no Construtor (/v1/form-constructor).',
    };
  }
  return { form, error: null };
}

/**
 * Pre-preenche a FK com o id ja criado na etapa anterior e trava a edicao
 * so nesta tela — o build gravado no banco continua exatamente como o
 * usuario configurou no construtor (sem hidden/readOnly no schema salvo).
 * @param schema schema renderizavel do card seguinte (ja resolvido)
 * @param fieldName nome do campo FK a sobrescrever (ex.: FK_FIELD)
 * @param value id (como string) retornado pelo submit da etapa anterior
 * @returns novo schema com o campo FK marcado com defaultValue + readOnly
 */
function prefillFkField(schema: FormGridSchema, fieldName: string, value: string): FormGridSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((f) => {
        if (f.name !== fieldName) return f;
        // So sobrescreve campos texto-like (o build da FK e sempre 'text'/'password');
        // outros tipos (checkbox, select, ...) tem defaultValue de formato diferente.
        if (f.type !== undefined && f.type !== 'text' && f.type !== 'password') return f;
        return { ...f, defaultValue: value, readOnly: true };
      }),
    })),
  };
}

export default function RegisterPage() {
  const toast = useToast();

  /**
   * =========================================================================
   * BLOCO 3 — ESTADO DO COMPONENTE
   * =========================================================================
   *
   * O QUE FAZ: guarda os dois RenderForm carregados (login e cadastro), o
   * erro/loading da carga inicial, uma chave de remontagem dos <form> apos
   * reset (reloadKey), o resultado do submit do card 1 (managerId /
   * managerUsername), os flags de "enviando" de cada card e a flag de
   * conclusao do wizard (done).
   * CONEXAO: populado por load() (Bloco 4) e pelos handlers de submit
   * (Bloco 5); consumido direto no JSX (Bloco 6) para decidir qual
   * card/estado exibir.
   * -------------------------------------------------------------------------
   */
  const [formManager, setFormManager] = useState<RenderForm | null>(null);
  const [formProfile, setFormProfile] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [managerId, setManagerId] = useState<string | null>(null);
  const [managerUsername, setManagerUsername] = useState<string | null>(null);
  const [submittingManager, setSubmittingManager] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [done, setDone] = useState(false);

  /**
   * =========================================================================
   * BLOCO 4 — CARREGAMENTO DE DADOS
   * =========================================================================
   *
   * O QUE FAZ: dispara em paralelo (Promise.all) a busca do form ativo de
   * login (user_manager) e de cadastro (user_profiles) via
   * loadFormByTable(). Se qualquer uma delas voltar com error, a carga para
   * ali (curto-circuito) e o erro e exibido via EmptyState — so preenche
   * formManager/formProfile quando as duas etapas tem exatamente 1 form
   * ativo valido.
   * POR QUE E IMPORTANTE: garante que o wizard nunca comece com uma etapa
   * faltando (build nao publicado, duplicado ou sem campos configurados).
   * CONEXAO: load() e chamado pelo useEffect de montagem logo abaixo, e de
   * novo por handleReset() (Bloco 5, via reloadKey) quando o usuario clica
   * em "Novo cadastro".
   * -------------------------------------------------------------------------
   */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [manager, profile] = await Promise.all([
        loadFormByTable(TABLE_MANAGER, 'login'),
        loadFormByTable(TABLE_PROFILE, 'cadastro'),
      ]);
      const problem = manager.error ?? profile.error;
      if (problem) {
        setError(problem);
        return;
      }
      setFormManager(manager.form);
      setFormProfile(profile.form);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar os formularios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * =========================================================================
   * BLOCO 5 — HANDLERS DE ACAO
   * =========================================================================
   *
   * O QUE FAZ: respondem aos eventos de submit de cada card e ao clique de
   * "Novo cadastro". Os dois handlers de submit seguem o mesmo fluxo ponta
   * a ponta: validam o form nativo (checkValidity/reportValidity), montam o
   * payload com formDataToPayload(), escolhem metodo/URL com
   * senderFor()/resolveEndpoint() a partir do meta do form ativo, enviam,
   * normalizam a resposta e atualizam estado + toast de sucesso/erro.
   * CONEXAO: consomem utils/formSubmit (formDataToPayload, errorDetail,
   * resolveEndpoint, senderFor) e utils/apiResult (normalizeItem); escrevem
   * em managerId/managerUsername/done, que o JSX (Bloco 6) usa para avancar
   * de card.
   * -------------------------------------------------------------------------
   */

  /**
   * Submit do card 1 (login/user_manager). Cria o registro em user_manager
   * e guarda o id retornado — esse id e usado depois para pre-preencher a
   * FK do card 2 (ver prefillFkField() e a derivacao de profileSchema mais
   * abaixo).
   * @param event evento de submit do form do card 1
   */
  const handleManagerSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }
      if (!formManager?.meta.submitEndpoint) {
        toast.error('Formulario de login sem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const payload = formDataToPayload(el);
      const send = senderFor(formManager.meta.httpMethod);
      const path = resolveEndpoint(formManager.meta.submitEndpoint);

      setSubmittingManager(true);
      try {
        const res = await send(path, payload);
        const row = normalizeItem<ApiRow>(res);
        const id = row?.id;
        if (typeof id !== 'string' && typeof id !== 'number') {
          toast.error('Registro criado sem id na resposta.', { title: 'Erro ao enviar' });
          return;
        }
        setManagerId(String(id));
        setManagerUsername(typeof row?.username === 'string' ? row.username : null);
        toast.success('Login criado.', { title: formManager.meta.title });
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao enviar' });
        } else {
          toast.error('Falha inesperada ao enviar.', { title: 'Erro ao enviar' });
        }
      } finally {
        setSubmittingManager(false);
      }
    },
    [formManager, toast],
  );

  /**
   * Submit do card 2 (cadastro/user_profiles). So e chamado quando
   * profileSchema ja existe, ou seja, quando o login do card 1 ja foi
   * criado. Em caso de erro, a mensagem deixa explicito que o login ja foi
   * criado (para o usuario nao tentar repetir o card 1) e orienta a
   * reenviar so o card 2.
   * @param event evento de submit do form do card 2
   */
  const handleProfileSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }
      if (!formProfile?.meta.submitEndpoint) {
        toast.error('Formulario de cadastro sem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const payload = formDataToPayload(el);
      const send = senderFor(formProfile.meta.httpMethod);
      const path = resolveEndpoint(formProfile.meta.submitEndpoint);

      setSubmittingProfile(true);
      try {
        await send(path, payload);
        toast.success('Cadastro criado.', { title: formProfile.meta.title });
        setDone(true);
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(
            `${err.message}${errorDetail(err)} — o login ja foi criado (usuario: ${managerUsername ?? managerId}); tente concluir o cadastro novamente.`,
            { title: 'Erro ao enviar' },
          );
        } else {
          toast.error('Falha inesperada ao enviar.', { title: 'Erro ao enviar' });
        }
      } finally {
        setSubmittingProfile(false);
      }
    },
    [formProfile, managerId, managerUsername, toast],
  );

  /**
   * Reseta o wizard para um novo cadastro: limpa o id/username do login
   * criado, tira a flag "done" e incrementa reloadKey para remontar os
   * <form> (via key={`manager-${reloadKey}`} / key={`profile-${reloadKey}`})
   * com estado interno limpo.
   */
  const handleReset = useCallback(() => {
    setManagerId(null);
    setManagerUsername(null);
    setDone(false);
    setReloadKey((k) => k + 1);
  }, []);

  /**
   * Schema do card 2 com a FK ja pre-preenchida/travada com o id do login
   * criado no card 1. So existe quando ha form de perfil carregado E o
   * login ja foi criado (managerId setado) — por isso o card 2 so aparece
   * no JSX depois do card 1 (ver condicao "formProfile && profileSchema").
   */
  const profileSchema =
    formProfile && managerId ? prefillFkField(formProfile.schema, FK_FIELD, managerId) : null;

  /**
   * =========================================================================
   * BLOCO 6 — RENDERIZACAO (JSX)
   * =========================================================================
   *
   * O QUE FAZ: cabecalho da pagina + estado de loading/erro + (quando
   * concluido) tela de sucesso + os dois cards do wizard, cada um so
   * aparecendo quando as condicoes da etapa anterior forem satisfeitas.
   * -------------------------------------------------------------------------
   */
  return (
    <>
      {/* Cabecalho da pagina, com link de volta para a listagem de usuarios */}
      <PageHeader
        title="Novo Cadastro"
        subtitle="Duas tabelas ligadas por chave: login (user_manager) e depois perfil (user_profiles)"
      >
        <Link className="btn btn-outline-secondary" to={paths.v1.user.list}>
          Voltar
        </Link>
      </PageHeader>

      {/* Estado de carregamento inicial (busca dos 2 forms ativos) */}
      {loading && <LoadingOverlay />}

      {/* Estado de erro: form ausente/duplicado/sem campos em alguma etapa */}
      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {/* Estado de sucesso: wizard concluido, oferece login ou novo cadastro */}
      {!loading && !error && done && (
        <EmptyState title="Cadastro criado com sucesso" variant="muted">
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link className="btn btn-primary" to={paths.v1.auth.login}>
              Entrar agora
            </Link>
            <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
              Novo cadastro
            </button>
          </div>
        </EmptyState>
      )}

      {/* Card 1 — login (user_manager): form ate managerId ser definido, depois vira aviso */}
      {!loading && !error && !done && formManager && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h2 className="h5 mb-3">1. {formManager.meta.title}</h2>

            {managerId === null ? (
              <form key={`manager-${reloadKey}`} onSubmit={(e) => void handleManagerSubmit(e)} noValidate>
                <FormGrid schema={formManager.schema} />
                <div className="d-flex mt-4 pt-3 border-top">
                  <button type="submit" className="btn btn-primary" disabled={submittingManager}>
                    {submittingManager ? 'Criando...' : 'Criar login'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="alert alert-success mb-0">
                Login criado — usuário <strong>{managerUsername ?? managerId}</strong> (id {managerId}).
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card 2 — cadastro (user_profiles): so aparece com FK ja pre-preenchida */}
      {!loading && !error && !done && formProfile && profileSchema && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h2 className="h5 mb-3">2. {formProfile.meta.title}</h2>
            <form key={`profile-${reloadKey}`} onSubmit={(e) => void handleProfileSubmit(e)} noValidate>
              <FormGrid schema={profileSchema} />
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <button type="submit" className="btn btn-primary" disabled={submittingProfile}>
                  {submittingProfile ? 'Enviando...' : 'Concluir cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
