/**
 * =========================================================================
 * FILE HEADER — components/ui/IconSelect/index.tsx
 * =========================================================================
 *
 * PROPOSITO: seletor de icone do Bootstrap Icons, com busca. Separado do
 * `select` do FormGrid de proposito: `<option>` nao renderiza
 * `<i class="bi ...">`, entao este e um dropdown proprio (div) que mostra o
 * glifo + o nome (ex.: "arrow-down-left-circle-fill").
 *
 * Fonte dos nomes: bootstrap-icons/font/bootstrap-icons.json (pacote
 * instalado, mesma versao da fonte carregada em src/bootstrap.ts). A ordem
 * do JSON = ordem dos IDs da tabela `bootstrap_icons` (o seeder inseriu
 * nessa ordem).
 *
 * Favoritos (./favoritos.ts) aparecem primeiro, com um separador antes do
 * resto. A tabela do banco (com `is_favorite`) ainda nao e consultada aqui
 * — falta endpoint (ver comentario em favoritos.ts).
 *
 * DEPENDENCIAS: bootstrap-icons/font/bootstrap-icons.json (nomes reais dos
 * icones) e ./favoritos (ICON_FAVORITOS).
 * CONSUMIDORES: qualquer form/builder que precise escolher um icone
 * Bootstrap (ex.: builders de menu/nav que gravam o nome do icone).
 *
 * COMO REAPROVEITAR: controlar `value`/`onChange` como um input comum —
 * `value` e o nome do icone sem `bi-`; renderizar `<i className={`bi bi-${value}`} />`
 * onde for exibir o icone escolhido.
 * -------------------------------------------------------------------------
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import iconsData from 'bootstrap-icons/font/bootstrap-icons.json';
import { ICON_FAVORITOS } from './favoritos';

// Ordem base: nomes na ordem do JSON (nao alfabetica) = ordem dos IDs.
const NOMES: string[] = Object.keys(iconsData);
const NOMES_SET = new Set(NOMES);

// Favoritos validos, sem duplicar, na ordem declarada em ICON_FAVORITOS.
const FAVORITOS: string[] = [...new Set(ICON_FAVORITOS)].filter((n) => NOMES_SET.has(n));
const FAV_SET = new Set(FAVORITOS);

export interface IconSelectProps {
  value: string;
  onChange: (name: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function IconSelect({
  value,
  onChange,
  id,
  placeholder = 'Buscar ícone...',
  disabled = false,
}: IconSelectProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const inputId = id ?? autoId;

  const { favs, resto } = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const casa = (n: string) => (q ? n.includes(q) : true);
    return {
      favs: FAVORITOS.filter(casa),
      resto: NOMES.filter((n) => !FAV_SET.has(n) && casa(n)),
    };
  }, [busca]);

  const total = favs.length + resto.length;

  useEffect(() => {
    if (!aberto) return;
    function onDocMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
        setBusca('');
      }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [aberto]);

  function selecionar(nome: string) {
    onChange(nome);
    setAberto(false);
    setBusca('');
  }

  function linha(nome: string) {
    return (
      <button
        type="button"
        key={nome}
        className={`dropdown-item d-flex align-items-center gap-2${nome === value ? ' active' : ''}`}
        onClick={() => selecionar(nome)}
      >
        <i
          className={`bi bi-${nome}`}
          aria-hidden="true"
          style={{ fontSize: '1.1rem', width: '1.25rem', textAlign: 'center' }}
        />
        <span className="text-truncate">{nome}</span>
      </button>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div className="input-group input-group-sm">
        <span
          className="input-group-text"
          style={{ minWidth: '2.25rem', justifyContent: 'center' }}
        >
          <i
            className={`bi ${value ? `bi-${value}` : 'bi-question-square text-muted'}`}
            aria-hidden="true"
          />
        </span>
        <input
          type="text"
          id={inputId}
          className="form-control"
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          value={aberto ? busca : value}
          onFocus={() => {
            if (!disabled) {
              setAberto(true);
              setBusca('');
            }
          }}
          onChange={(e) => {
            setBusca(e.target.value);
            setAberto(true);
          }}
        />
        {value && !disabled && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            title="Limpar ícone"
            onClick={() => {
              onChange('');
              setBusca('');
            }}
          >
            &times;
          </button>
        )}
      </div>

      {aberto && !disabled && (
        <div
          className="border rounded bg-body shadow-sm py-1"
          style={{
            position: 'absolute',
            zIndex: 1050,
            width: '100%',
            marginTop: 2,
            maxHeight: '16rem',
            overflowY: 'auto',
          }}
        >
          {total === 0 ? (
            <div className="px-3 py-2 text-muted small">Nenhum ícone encontrado.</div>
          ) : (
            <>
              {favs.length > 0 && (
                <>
                  <div
                    className="px-3 pt-1 text-muted text-uppercase"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.06em' }}
                  >
                    Favoritos
                  </div>
                  {favs.map(linha)}
                  <hr className="dropdown-divider my-1" />
                </>
              )}
              {resto.map(linha)}
            </>
          )}
          <div
            className="px-3 pt-1 mt-1 border-top text-muted"
            style={{ fontSize: '0.68rem', fontStyle: 'italic' }}
          >
            {`${total} ícone${total !== 1 ? 's' : ''}`}
          </div>
        </div>
      )}
    </div>
  );
}
