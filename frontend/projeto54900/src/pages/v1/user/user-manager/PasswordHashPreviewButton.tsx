// Botao dev-only, exclusivo desta tela (CreatePage.tsx de user-manager): abre
// um modal pequeno com senha -> hash bcrypt equivalente ao que o backend
// produziria (Processor.php faz password_hash($senha, PASSWORD_BCRYPT), cost
// default 10). Gated por isDevHost() (config/envHost.ts), mesmo padrao de
// components/global/ApiDebugPanel.tsx e FakeFillButton.tsx.
//
// O botao-gatilho e registrado no slot de services/devToolsExtra.ts para
// aparecer na MESMA LINHA do DEBUG (ApiDebugPanel.tsx, montado pelo
// RootLayout apos o Outlet) — nao da para renderiza-lo direto no form desta
// pagina porque o DEBUG vive num container separado, fora do Outlet.
//
// Importante: bcrypt gera um salt aleatorio a cada chamada, entao o hash
// exibido aqui NUNCA sera identico, byte a byte, ao que o backend gravaria
// para a mesma senha — mas usa o mesmo algoritmo e o mesmo cost (10), e
// qualquer um dos dois hashes valida a mesma senha igualmente
// (password_verify). Uso exclusivo de conferencia manual em dev.

import { useEffect, useState } from 'react';
import { hashSync } from 'bcryptjs';

import Modal from '@/components/global/Modal';
import { isDevHost } from '@/config/envHost';
import { setExtra, clearExtra } from '@/services/devToolsExtra';

const BCRYPT_COST = 10;

export default function PasswordHashPreviewButton() {
  const [open, setOpen] = useState(false);
  const [senha, setSenha] = useState('');
  const [hash, setHash] = useState('');

  useEffect(() => {
    if (!senha) {
      setHash('');
      return;
    }
    setHash(hashSync(senha, BCRYPT_COST));
  }, [senha]);

  useEffect(() => {
    if (!isDevHost()) return;
    setExtra(
      <button
        type="button"
        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
        onClick={() => setOpen(true)}
      >
        <i className="bi bi-key-fill" />
        HASH
      </button>,
    );
    return () => clearExtra();
  }, []);

  if (!isDevHost()) return null;

  return (
    <Modal open={open} title="DEBUG — preview de hash bcrypt" onClose={() => setOpen(false)} size="sm">
      <p className="small text-body-secondary">
        Gerado no navegador (bcryptjs, cost {BCRYPT_COST}) — mesmo algoritmo e cost do backend
        (<code>password_hash</code>/<code>PASSWORD_BCRYPT</code>). O salt e aleatorio a cada calculo, entao o
        hash abaixo nunca sera identico ao gravado no banco para a mesma senha, mas valida a senha do mesmo jeito.
      </p>

      <div className="mb-3">
        <label htmlFor="password-hash-preview-input" className="form-label">
          Senha
        </label>
        <input
          id="password-hash-preview-input"
          type="text"
          className="form-control"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="password-hash-preview-output" className="form-label">
          Hash bcrypt
        </label>
        <textarea
          id="password-hash-preview-output"
          className="form-control font-monospace small"
          rows={3}
          value={hash}
          readOnly
        />
      </div>
    </Modal>
  );
}
