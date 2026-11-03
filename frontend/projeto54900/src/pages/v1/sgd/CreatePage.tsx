// Cadastro de documento do SGD — build 'criar-sgd' (form_manager, formulario com um unico campo de upload).
// Wrapper do componente global RecordFormBuild. Ao escolher o arquivo, o DocumentFieldReader faz o OCR
// no navegador e mostra abaixo os campos identificados pelo dicionario (catalogs/sgd).
// O botao Enviar ainda nao faz nada: o submit e barrado aqui (nada e enviado) ate existir o backend.
import DocumentFieldReader from '@/components/global/DocumentFieldReader';
import RecordFormBuild from '@/components/global/RecordFormBuild';
import { sgdDictionary, sgdSections, sgdStructure, sgdTypes } from '@/catalogs/sgd';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  return (
    <div
      onSubmitCapture={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <RecordFormBuild
        slug="criar-sgd"
        backPath={paths.v1.sgd.list}
        successMessage="Documento enviado."
        fallbackTitle="SGD — Novo documento"
        afterFields={<DocumentFieldReader dictionary={sgdDictionary} types={sgdTypes} sections={sgdSections} structure={sgdStructure} />}
      />
    </div>
  );
}
