import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="404" subtitle="Pagina nao encontrada" />
      <EmptyState title="Este endereco nao existe" description="Verifique o link ou volte ao inicio.">
        <Link className="btn btn-primary" to={paths.home}>
          Voltar ao inicio
        </Link>
      </EmptyState>
    </>
  );
}
