// Placeholder de uma versao de API ainda sem modulos no frontend (ex.: v1a).

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

export interface VersionPlaceholderPageProps {
  version?: string;
}

export default function VersionPlaceholderPage({ version = 'v1a' }: VersionPlaceholderPageProps) {
  return (
    <>
      <PageHeader title={`API ${version}`} subtitle="Versao reservada" />
      <EmptyState
        title={`Nenhum modulo em ${version} ainda`}
        description={`Espelha o namespace Api\\${version.toUpperCase()} do backend. Ver routes/${version}/README.md.`}
      />
    </>
  );
}
