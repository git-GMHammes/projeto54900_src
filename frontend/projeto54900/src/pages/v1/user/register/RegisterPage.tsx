// Novo Cadastro — wizard em 2 cards (nao abas), um card por TABELA, ligados por
// chave estrangeira. Cada card usa o form_manager ATIVO cuja fm_table_name seja
// a tabela da etapa — nunca um slug/ID fixo, para nao depender de quem montou o
// build nem de qual banco/maquina (ver loadFormByTable() abaixo):
//   1. Login    -> form ativo da tabela user_manager, INTEIRO: username +
//                  password_hash juntos, como configurado no FormBuilderPage.
//                  Grava de verdade (POST) e guarda o id retornado.
//   2. Cadastro -> form ativo da tabela user_profiles, INTEIRO. So aparece
//                  depois do login confirmado. O campo user_manager_id (FK) vem
//                  pre-preenchido com o id do passo 1 e read-only NESTA TELA
//                  (o build em si continua exatamente como configurado — visivel,
//                  sem hidden/collapse).
//
// Nao dividimos campos de um MESMO build entre cards — cada card e um build
// completo. As etapas existem para encadear tabelas diferentes, nao para
// fatiar um formulario so.
//
// Fica em pasta propria (register/) dentro do modulo user porque e um fluxo
// composto entre 2 recursos (user-manager + user-profiles), nao a acao de uma
// tabela so — ver src/markdown/geral/README_paginas_modulo.md.

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

// Resolucao por TABELA (fm_table_name, fonte de verdade gravada na criacao do
// form_manager) + status ativo — nao por slug/ID de quem construiu o formulario.
// Assim a tela funciona em qualquer maquina/banco, desde que exista 1 form
// ativo publicado para cada tabela do modulo (ver README_form_constructor.md).
const TABLE_MANAGER = 'user_manager';
const TABLE_PROFILE = 'user_profiles';
const FK_FIELD = 'user_manager_id';

interface LoadFormResult {
  form: RenderForm | null;
  /** null = ok; string = motivo (indisponivel ou duplicidade). */
  error: string | null;
}

function distinctManagerIds(rows: readonly ApiRow[]): number[] {
  const ids = new Set<number>();
  for (const row of rows) {
    const v = row.fm_id;
    const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
    if (Number.isFinite(n)) ids.add(n);
  }
  return [...ids];
}

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

// Pre-preenche a FK com o id ja criado e trava edicao so na tela do wizard —
// o build no banco continua exatamente como o usuario configurou (sem hidden).
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

  const handleReset = useCallback(() => {
    setManagerId(null);
    setManagerUsername(null);
    setDone(false);
    setReloadKey((k) => k + 1);
  }, []);

  const profileSchema =
    formProfile && managerId ? prefillFkField(formProfile.schema, FK_FIELD, managerId) : null;

  return (
    <>
      <PageHeader
        title="Novo Cadastro"
        subtitle="Duas tabelas ligadas por chave: login (user_manager) e depois perfil (user_profiles)"
      >
        <Link className="btn btn-outline-secondary" to={paths.v1.user.list}>
          Voltar
        </Link>
      </PageHeader>

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

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
