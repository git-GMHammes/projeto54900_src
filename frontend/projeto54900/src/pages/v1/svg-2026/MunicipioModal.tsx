// Modal do municipio clicado no mapa SVG-2026: cards do Menezes, do Flavio
// Bolsonaro e do Douglas Ruas lado a lado (empilhados no mobile), com os votos
// no municipio e a totalizacao no Rio de Janeiro. Controlado por estado React.
// Renderizado via ThemePortal (portal no document.body com a paleta da empresa):
// dentro do conteudo do template o position: fixed/backdrop ficariam presos ao
// contexto de empilhamento dele, e um portal puro perderia o tema dark.

import ThemePortal from '@/components/template/ThemePortal';

import { CANDIDATOS, formatarPctEleitorado, formatarVotos, urlFoto, type TotaisMunicipio, type VotosPorCargo } from './eleicoes2026';

interface Props {
  nomeMunicipio: string;
  totaisMunicipio: TotaisMunicipio | undefined;
  totalRj: VotosPorCargo | null;
  carregando: boolean;
  aviso: string | null;
  onClose: () => void;
}

export default function MunicipioModal({ nomeMunicipio, totaisMunicipio, totalRj, carregando, aviso, onClose }: Props) {
  return (
    <ThemePortal>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" onClick={onClose}>
        <div
          className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{nomeMunicipio}</h5>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} />
            </div>
            <div className="modal-body">
              {aviso ? (
                <div className="alert alert-warning mb-0">{aviso}</div>
              ) : carregando ? (
                <div className="text-center text-muted small py-3">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Carregando votos...
                </div>
              ) : (
                <div className="row g-3">
                  {CANDIDATOS.map((c) => (
                    <div className="col-12 col-md-4" key={c.chave}>
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="text-center">
                            <img
                              src={urlFoto(c)}
                              alt={c.nome}
                              className="rounded-circle object-fit-cover border"
                              width={96}
                              height={96}
                            />
                            <div className="fw-semibold mt-2">{c.nome}</div>
                            <div className="text-muted small">{c.cargo} · {c.numero}</div>
                          </div>
                          <div className="mt-2 small text-muted">Votos em {nomeMunicipio}</div>
                          <div className="fs-3 fw-bold">{formatarVotos(totaisMunicipio?.votos[c.cargo] ?? 0)}</div>
                          {totaisMunicipio && totaisMunicipio.eleitores > 0 && (
                            <div className="small text-muted">
                              {formatarPctEleitorado(totaisMunicipio.votos[c.cargo] ?? 0, totaisMunicipio.eleitores)} do
                              eleitorado ({formatarVotos(totaisMunicipio.eleitores)} eleitores)
                            </div>
                          )}
                          <hr />
                          <div className="small text-muted">Total no Rio de Janeiro</div>
                          <div className="fs-4 fw-semibold">{formatarVotos(totalRj?.[c.cargo] ?? 0)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </ThemePortal>
  );
}
