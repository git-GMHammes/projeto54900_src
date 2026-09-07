// Detalhe de um anexo — api/v1/upload-manager-view/get/{id}

import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { uploadManagerView, uploadManagerUpload } from '@/services/v1';
import { useApi } from '@/hooks/useApi';
import { normalizeItem } from '@/utils/apiResult';
import { formatBytes, formatDateTime, toText } from '@/utils/format';

import PageHeader from '@/components/global/PageHeader';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import EmptyState from '@/components/global/EmptyState';

export default function UploadViewPage() {
  const { id } = useParams();
  const { data, error, loading, run } = useApi((signal) =>
    uploadManagerView.get(id ?? '', { signal }),
  );

  useEffect(() => {
    void run();
  }, [run, id]);

  const item = useMemo(() => normalizeItem(data), [data]);

  return (
    <>
      <PageHeader title={`Anexo #${id ?? ''}`} subtitle="api/v1/upload-manager-view">
        <Link className="btn btn-outline-secondary" to={paths.v1.upload.list}>
          Voltar
        </Link>
        <a
          className="btn btn-primary"
          href={uploadManagerUpload.downloadUrl(id ?? '')}
          target="_blank"
          rel="noreferrer"
        >
          Baixar
        </a>
      </PageHeader>

      {loading && <LoadingOverlay />}

      {!loading && error && (
        <EmptyState variant="danger" title="Falha ao carregar" description={error.message}>
          <button className="btn btn-outline-danger btn-sm" onClick={() => void run()}>
            Tentar novamente
          </button>
        </EmptyState>
      )}

      {!loading && !error && !item && <EmptyState title="Anexo nao encontrado" />}

      {!loading && !error && item && (
        <div className="card">
          <div className="card-body">
            <dl className="row mb-0">
              {Object.entries(item).map(([field, value]) => {
                let shown = toText(value);
                if (field.includes('_at')) shown = formatDateTime(value);
                else if (field === 'size' || field === 'file_size') shown = formatBytes(value);
                return (
                  <div className="col-12 col-sm-6" key={field}>
                    <dt className="text-body-secondary small text-uppercase">{field}</dt>
                    <dd className="text-break">{shown}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
