// Componente global: le o documento escolhido no campo de upload do <form> em que ele esta
// (ex.: `afterFields` do RecordFormBuild), passa o OCR e mostra abaixo `chave : "valor"` dos
// campos reconhecidos pelo dicionario. Tudo no navegador — nada e enviado.
// Recebe o dicionario por props; nao conhece rota nem modulo.

import { useEffect, useRef, useState } from 'react';

import { extractFields } from '@/utils/documentFields';
import type { FieldDictionary, FieldTypes, FoundField, SectionDictionary } from '@/utils/documentFields';
import { recognizeDocument } from '@/utils/documentOcr';
import { extractStructure } from '@/utils/documentStructure';
import type { StructureRules } from '@/utils/documentStructure';

export interface DocumentFieldReaderProps {
  dictionary: FieldDictionary;
  /** `chave -> tipo de valor` para corrigir o que o OCR leu de errado (ex.: e-mail). */
  types?: FieldTypes;
  /** `prefixo -> titulos de secao`: o mesmo rotulo em blocos diferentes vira `<prefixo>_<chave>`. */
  sections?: SectionDictionary;
  /** Dados sem rotulo (por forma ou posicao) e texto corrido; so completa o que o dicionario nao achou. */
  structure?: StructureRules;
}

type Status = 'idle' | 'reading' | 'done' | 'error';

export default function DocumentFieldReader({ dictionary, types, sections, structure }: DocumentFieldReaderProps) {
  const anchor = useRef<HTMLDivElement>(null);
  const run = useRef(0);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState({ percent: 0, label: '' });
  const [fields, setFields] = useState<FoundField[]>([]);
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const form = anchor.current?.closest('form');
    if (!form) return undefined;

    const onChange = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== 'file') return;

      const file = input.files?.[0];
      const id = (run.current += 1);
      setFields([]);
      setText('');
      setMessage('');
      if (!file) {
        setStatus('idle');
        return;
      }

      setStatus('reading');
      setProgress({ percent: 0, label: 'Iniciando' });
      recognizeDocument(file, (percent, label) => {
        if (run.current === id) setProgress({ percent, label });
      })
        .then((recognized) => {
          if (run.current !== id) return;
          setText(recognized.text);
          const labeled = extractFields(recognized.lines, dictionary, types, sections);
          const taken = new Set(labeled.map((f) => f.key));
          const loose = structure ? extractStructure(recognized.lines, structure, types).filter((f) => !taken.has(f.key)) : [];
          setFields([...labeled, ...loose]);
          setStatus('done');
        })
        .catch((err: unknown) => {
          if (run.current !== id) return;
          setMessage(err instanceof Error ? err.message : 'Falha ao ler o documento.');
          setStatus('error');
        });
    };

    form.addEventListener('change', onChange);
    return () => form.removeEventListener('change', onChange);
  }, [dictionary, types, sections, structure]);

  return (
    <div ref={anchor} className="mt-3">
      {status === 'reading' && (
        <div className="mb-3">
          <div className="small text-body-secondary mb-1">
            {progress.label} — {progress.percent}%
          </div>
          <div className="progress" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}

      {status === 'error' && <div className="alert alert-danger py-2">{message}</div>}

      {status === 'done' && (
        <>
          {fields.length === 0 ? (
            <div className="alert alert-warning py-2">Nenhum campo do dicionário foi identificado no documento.</div>
          ) : (
            <ul className="list-unstyled mb-3">
              {fields.map((field) => (
                <li key={field.key} className="mb-1">
                  <code className="fw-semibold">{field.key}</code> : <span>&quot;{field.value}&quot;</span>
                </li>
              ))}
            </ul>
          )}

          <details>
            <summary className="small text-body-secondary">Texto reconhecido</summary>
            <pre className="small mt-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
              {text || '(vazio)'}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}
