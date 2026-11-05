// Resultado por municipio marcado no Offcanvas, abaixo do mapa: um Collapse
// por municipio com 2 cards em row/col (empilhados no mobile; lista de bairros com rolagem interna de ate 60vh) (Menezes e Flavio). Cada card
// lista os bairros agrupados com o total de votos; clicar no bairro abre um
// Collapse discreto com a tabela de secoes (Local / Zona-Secao / Votos).
// Tudo ordenado do maior para o menor voto. Collapse controlado por estado.

import { useEffect, useState } from 'react';

import {
  CANDIDATOS,
  SEM_BAIRRO,
  carregarBairros,
  carregarSecoes,
  formatarPctEleitorado,
  formatarVotos,
  urlFoto,
  type BairroVotos,
  type Candidato,
  type SecaoVotos,
} from './eleicoes2026';

type BairrosPorCandidato = Record<Candidato['chave'], BairroVotos[]>;

function mensagemErro(err: unknown): string {
  const status = typeof err === 'object' && err !== null && 'status' in err ? err.status : null;
  return status === 401 || status === 403
    ? 'Acesso restrito: os votos por bairro só estão disponíveis para administradores.'
    : 'Não foi possível carregar os votos.';
}

function TabelaSecoes({ cdTse, bairro, cargo }: { cdTse: string; bairro: string; cargo: string }) {
  const [secoes, setSecoes] = useState<SecaoVotos[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    carregarSecoes(cdTse, bairro, cargo)
      .then((s) => { if (ativo) setSecoes(s); })
      .catch((err: unknown) => {
        console.error('[Svg2026] Falha ao carregar seções:', err);
        if (ativo) setErro(mensagemErro(err));
      });
    return () => { ativo = false; };
  }, [cdTse, bairro, cargo]);

  if (erro) return <div className="small text-danger px-2 py-1">{erro}</div>;
  if (!secoes) return <div className="small text-muted px-2 py-1">Carregando seções...</div>;

  return (
    <table className="table table-sm table-borderless align-middle mb-0 small">
      <thead>
        <tr className="border-bottom">
          <th>Local</th>
          <th>Zona/Sessão</th>
          <th className="text-end">Votos</th>
        </tr>
      </thead>
      <tbody>
        {secoes.map((s) => (
          <tr key={s.chave}>
            <td>
              <div>{s.local}</div>
              <div className="fst-italic text-secondary" style={{ fontSize: '0.75em' }}>{s.endereco}</div>
            </td>
            <td>
              <div>{s.zona}</div>
              <div>{s.secao}</div>
            </td>
            <td className="text-end">{formatarVotos(s.votos)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CardCandidato({ candidato, cdTse, bairros }: { candidato: Candidato; cdTse: string; bairros: BairroVotos[] }) {
  const [aberto, setAberto] = useState<string | null>(null);
  const total = bairros.reduce((soma, b) => soma + b.votos, 0);

  return (
    <div className="card overflow-hidden">
      <div className="card-header text-center">
        <img
          src={urlFoto(candidato)}
          alt={candidato.nome}
          className="rounded-circle object-fit-cover border"
          width={64}
          height={64}
        />
        <div className="fw-semibold mt-1">{candidato.nome}</div>
        <span className="badge text-bg-secondary">{formatarVotos(total)}</span>
      </div>
      <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '60vh' }}>
        {bairros.map((b) => {
          const expandido = aberto === b.bairro;
          return (
            <div key={b.bairro} className="list-group-item p-0">
              <button
                type="button"
                className="btn btn-link text-decoration-none text-body w-100 d-flex justify-content-between px-3 py-2"
                aria-expanded={expandido}
                disabled={b.bairro === SEM_BAIRRO}
                onClick={() => setAberto(expandido ? null : b.bairro)}
              >
                <span className="text-start">{b.bairro}</span>
                <span className="fw-semibold">{formatarVotos(b.votos)}</span>
              </button>
              {b.eleitores > 0 && (
                <div className="form-text fst-italic text-body-tertiary px-3 pb-2" style={{ marginTop: '-0.25rem' }}>
                  {formatarPctEleitorado(b.votos, b.eleitores)} do eleitorado do bairro ({formatarVotos(b.eleitores)} eleitores)
                </div>
              )}
              {expandido && (
                <div className="bg-body-tertiary px-2 pb-2">
                  <TabelaSecoes cdTse={cdTse} bairro={b.bairro} cargo={candidato.cargo} />
                </div>
              )}
            </div>
          );
        })}
        {bairros.length === 0 && <div className="list-group-item small text-muted">Sem votos registrados.</div>}
      </div>
    </div>
  );
}

function ResultadoUm({ cdTse, nome }: { cdTse: string; nome: string }) {
  const [aberto, setAberto] = useState(false);
  const [bairros, setBairros] = useState<BairrosPorCandidato | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    carregarBairros(cdTse)
      .then((b) => { if (ativo) setBairros(b); })
      .catch((err: unknown) => {
        console.error('[Svg2026] Falha ao carregar bairros:', err);
        if (ativo) setErro(mensagemErro(err));
      });
    return () => { ativo = false; };
  }, [cdTse]);

  return (
    <div className="card mb-3">
      <button
        type="button"
        className="btn btn-light text-start fw-semibold d-flex justify-content-between rounded-bottom-0"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        <span>{nome}</span>
        <i className={`bi ${aberto ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" />
      </button>
      <div className={`collapse ${aberto ? 'show' : ''}`}>
        <div className="card-body">
          {erro ? (
            <div className="alert alert-warning mb-0">{erro}</div>
          ) : !bairros ? (
            <div className="text-muted small">Carregando bairros...</div>
          ) : (
            <div className="row g-3">
              {CANDIDATOS.map((c) => (
                <div className="col-12 col-lg-6" key={c.chave}>
                  <CardCandidato candidato={c} cdTse={cdTse} bairros={bairros[c.chave]} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  /** Municipios marcados: CD_MUN (IBGE) na ordem da selecao. */
  selecionados: string[];
  nomePorCdMun: Record<string, string>;
  tsePorCdMun: Record<string, string>;
}

export default function ResultadosMunicipio({ selecionados, nomePorCdMun, tsePorCdMun }: Props) {
  if (selecionados.length === 0) return null;
  return (
    <div className="mt-3 text-start">
      {selecionados.map((cdMun) => {
        const cdTse = tsePorCdMun[cdMun];
        return cdTse ? <ResultadoUm key={cdMun} cdTse={cdTse} nome={nomePorCdMun[cdMun] ?? cdMun} /> : null;
      })}
    </div>
  );
}
