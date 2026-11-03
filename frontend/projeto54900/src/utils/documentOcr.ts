// OCR do documento NO NAVEGADOR: nada e enviado a servidor. Aceita imagem (PNG, JPG, ...)
// e PDF (cada pagina vira imagem e passa pelo OCR).
//
// Motor: PaddleOCR (PP-OCRv5, via @paddleocr/paddleocr-js + onnxruntime-web). Deteccao de linhas +
// reconhecimento com o modelo LATINO (portugues: acentos, `@`, pontuacao ASCII).
//
// Tudo e servido pelo proprio host (build estatico no Apache), sem CDN:
//   - modelos (.tar ONNX) -> `public/ocr/paddle/` (URL relativa ao <base> do app);
//   - runtime WASM do onnxruntime-web -> emitido pelo Vite (`?url` do node_modules);
//   - PDF: build `legacy` do pdfjs-dist (roda em navegadores sem as APIs mais novas do JS).
// As libs sao carregadas sob demanda (import dinamico), so quando o usuario escolhe um arquivo.

import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

import { boxFromPoly } from '@/utils/documentLayout';
import type { TextLine } from '@/utils/documentLayout';

export type OcrProgress = (percent: number, label: string) => void;

export interface OcrDocument {
  /** Texto reconhecido, uma caixa de texto por linha (paginas separadas por linha em branco). */
  text: string;
  /** Cada caixa de texto com a posicao na pagina — base da leitura por posicao (documentLayout.ts). */
  lines: TextLine[];
}

const MAX_PDF_PAGES = 10;
const PDF_SCALE = 2;
const PDF_TIMEOUT_MS = 30_000;

const DETECTION_MODEL = 'PP-OCRv5_mobile_det';
const RECOGNITION_MODEL = 'latin_PP-OCRv5_mobile_rec';

// Runtime WASM do onnxruntime-web: o `exports` do pacote nao deixa importar estes arquivos, entao o Vite os
// emite como estaticos pelo caminho relativo (a URL literal precisa ficar aqui para o bundler enxerga-la).
const ortMjsUrl = new URL('../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.mjs', import.meta.url).href;
const ortWasmUrl = new URL('../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm', import.meta.url).href;

const absolute = (path: string): string => new URL(path, document.baseURI).href;

// Arquivo de `public/` (copiado como esta pelo build). BASE_URL e '/' no dev e './' no build; no build
// o <base> do index.html fixa a raiz do app, entao a URL resolve em qualquer profundidade de rota.
const publicUrl = (path: string): string => absolute(`${import.meta.env.BASE_URL}${path}`);

// Evita barra de progresso parada para sempre se o leitor de PDF nao responder.
function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} demorou demais. Tente novamente ou use uma imagem.`));
    }, PDF_TIMEOUT_MS);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      },
    );
  });
}

async function pdfPagesToCanvases(file: File, onProgress: OcrProgress): Promise<HTMLCanvasElement[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = absolute(pdfWorkerUrl);

  const pdf = await withTimeout(
    pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise,
    'Abrir o PDF',
  );
  const total = Math.min(pdf.numPages, MAX_PDF_PAGES);
  const canvases: HTMLCanvasElement[] = [];

  for (let n = 1; n <= total; n += 1) {
    onProgress(Math.round(((n - 1) / total) * 20), `Preparando página ${n} de ${total}`);
    const page = await withTimeout(pdf.getPage(n), 'Ler a página do PDF');
    const viewport = page.getViewport({ scale: PDF_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await withTimeout(page.render({ canvas, viewport }).promise, 'Desenhar a página do PDF');
    canvases.push(canvas);
  }
  return canvases;
}

/** Le o documento e devolve o texto reconhecido e a posicao de cada caixa de texto. */
export async function recognizeDocument(file: File, onProgress: OcrProgress): Promise<OcrDocument> {
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  const sources: (File | HTMLCanvasElement)[] = isPdf ? await pdfPagesToCanvases(file, onProgress) : [file];

  onProgress(20, 'Carregando o leitor');
  // O WASM do runtime e servido pelo proprio host (emitido pelo Vite), nao por CDN.
  const { env } = await import('onnxruntime-web');
  env.wasm.wasmPaths = { mjs: absolute(ortMjsUrl), wasm: absolute(ortWasmUrl) };
  const { PaddleOCR } = await import('@paddleocr/paddleocr-js');
  const ocr = await PaddleOCR.create({
    ocrVersion: 'PP-OCRv5',
    textDetectionModelName: DETECTION_MODEL,
    textRecognitionModelName: RECOGNITION_MODEL,
    textDetectionModelAsset: { url: publicUrl(`ocr/paddle/${DETECTION_MODEL}.tar`) },
    textRecognitionModelAsset: { url: publicUrl(`ocr/paddle/${RECOGNITION_MODEL}.tar`) },
    ortOptions: { backend: 'wasm' },
  });

  try {
    const pages: string[] = [];
    const lines: TextLine[] = [];
    for (const [page, source] of sources.entries()) {
      onProgress(Math.round(20 + (page / sources.length) * 80), 'Lendo o documento');
      const [result] = await ocr.predict(source);
      const items = result?.items ?? [];
      pages.push(items.map((item) => item.text).join('\n'));
      for (const item of items) lines.push({ text: item.text, page, box: boxFromPoly(item.poly) });
    }
    onProgress(100, 'Concluído');
    return { text: pages.join('\n\n'), lines };
  } finally {
    await ocr.dispose();
  }
}
