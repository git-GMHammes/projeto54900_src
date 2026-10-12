/**
 * =========================================================================
 * FILE HEADER — components/map/MapLinksPanel.tsx
 * =========================================================================
 *
 * PROPOSITO: painel global "Mapa deste registro". Para QUALQUER modulo
 * registrado em Config/MapLinkables.php (inclusive Upload), mostra no mapa e em
 * lista os vinculos (endereco, CEP, ponto, rota com tempo de deslocamento) de
 * um registro e, se nao for somente leitura, permite vincular e remover.
 *
 *   <MapLinksPanel module="calendar-events" referenceId={12} />
 *   <MapLinksPanel module="messages-manager" referenceId={7} collection="travel" readOnly />
 *
 * PROPS: `module` + `referenceId` identificam o registro; `collection` filtra o
 * papel do vinculo (e e o papel padrao ao vincular); `readOnly` esconde
 * vincular/remover; `height` do mapa (padrao 420); `title`.
 *
 * DADOS: hooks/useMapLinks (view_map_links). Remover = exclusao logica
 * (delete-soft) com confirmacao e toast de resultado.
 *
 * ESTE COMPONENTE NAO USA useParams: quem decide o registro e a Page/pai.
 * -------------------------------------------------------------------------
 */

import { useMemo, useState } from 'react';

import ConfirmModal from '@/components/global/ConfirmModal';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import MapLinkPicker from '@/components/map/MapLinkPicker';
import MapView from '@/components/map/MapView';
import { useMapLinks } from '@/hooks/useMapLinks';
import { useToast } from '@/hooks/useToast';
import type { MapLinkViewRow } from '@/types/map';
import { LINK_COLORS, LINK_ICONS, errorText, linkSubtitle, linkTitle, linkToMarker, linkToPolyline } from '@/utils/mapLinks';

export interface MapLinksPanelProps {
  module: string;
  referenceId: number | string;
  collection?: string | undefined;
  readOnly?: boolean | undefined;
  height?: number | undefined;
  title?: string | undefined;
}

export default function MapLinksPanel({
  module,
  referenceId,
  collection,
  readOnly = false,
  height = 420,
  title = 'Mapa deste registro',
}: MapLinksPanelProps) {
  const toast = useToast();
  const { links, loading, error, reload, remove } = useMapLinks({ module, referenceId, collection });

  const [pickerOpen, setPickerOpen] = useState(false);
  const [toRemove, setToRemove] = useState<MapLinkViewRow | null>(null);
  const [removing, setRemoving] = useState(false);

  const markers = useMemo(() => links.flatMap((l) => linkToMarker(l) ?? []), [links]);
  const routes = useMemo(() => links.flatMap((l) => linkToPolyline(l) ?? []), [links]);

  async function confirmRemove() {
    if (!toRemove) return;
    setRemoving(true);
    try {
      await remove(toRemove.id);
      toast.success('Vínculo removido.');
      setToRemove(null);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section aria-label={title}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h5 mb-0">
          <i className="bi bi-map me-2" aria-hidden="true" />
          {title}
        </h2>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={reload} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
            Atualizar
          </button>
          {!readOnly && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setPickerOpen(true)}>
              <i className="bi bi-plus-lg me-1" aria-hidden="true" />
              Vincular
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading && links.length === 0 ? (
        <LoadingOverlay label="Carregando vínculos do mapa…" />
      ) : (
        <div className="row g-3">
          <div className="col-lg-7">
            <MapView height={height} markers={markers} routes={routes} />
          </div>
          <div className="col-lg-5">
            {links.length === 0 ? (
              <EmptyState
                title="Nenhum vínculo com o mapa"
                description={readOnly ? undefined : 'Use "Vincular" para adicionar um endereço, CEP, ponto ou rota.'}
              />
            ) : (
              <ul className="list-group">
                {links.map((link) => (
                  <li key={link.id} className="list-group-item d-flex align-items-start gap-2">
                    <i
                      className={`bi ${LINK_ICONS[link.ml_link_type]} fs-5`}
                      style={{ color: LINK_COLORS[link.ml_link_type] }}
                      aria-hidden="true"
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{linkTitle(link)}</div>
                      <div className="small text-body-secondary">{linkSubtitle(link)}</div>
                    </div>
                    {!readOnly && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        aria-label="Remover vínculo"
                        onClick={() => setToRemove(link)}
                      >
                        <i className="bi bi-trash" aria-hidden="true" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!readOnly && (
        <MapLinkPicker
          open={pickerOpen}
          module={module}
          referenceId={referenceId}
          collection={collection}
          onClose={() => setPickerOpen(false)}
          onLinked={reload}
        />
      )}

      <ConfirmModal
        open={toRemove !== null}
        title="Remover vínculo"
        message={toRemove ? `Remover "${linkTitle(toRemove)}" deste registro? O ponto, endereço ou rota continua cadastrado.` : null}
        confirmLabel="Remover"
        busy={removing}
        onConfirm={() => void confirmRemove()}
        onClose={() => setToRemove(null)}
      />
    </section>
  );
}
