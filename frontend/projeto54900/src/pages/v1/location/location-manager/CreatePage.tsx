// Cadastro de local -- build 'criar-local' (form_manager, tabela location_manager).
// Wrapper do LocationForm (Tipo e Local pai primeiro; Latitude/Longitude e mapa so para tipos fisicos).
// `?parent_id=` (botao "Novo local dentro deste" da arvore) pre-seleciona o pai.
// O codigo (opcional) ja vem sugerido na renderizacao (2 letras + 2 numeros, ex.: KX42) e passa a
// `slug-do-nome-KX42` enquanto se digita o nome; se o usuario editar o codigo a mao, para de acompanhar.
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { codeWithSuffix, randomSuffix } from '@/utils/slug';
import LocationForm from './LocationForm';

export default function CreatePage() {
  const [params] = useSearchParams();
  const parentId = params.get('parent_id') ?? '';
  const suffix = useMemo(randomSuffix, []);
  const autoSlug = useMemo(() => ({ from: 'name', to: 'code', format: (text: string) => codeWithSuffix(text, suffix) }), [suffix]);
  const defaults = useMemo(() => ({ status: 'active', code: suffix, ...(parentId ? { parent_id: parentId } : {}) }), [suffix, parentId]);

  return (
    <LocationForm
      slug="criar-local"
      backPath={paths.v1.locationManager.list}
      defaults={defaults}
      autoSlug={autoSlug}
      successMessage="Local cadastrado."
      fallbackTitle="Novo Local"
    />
  );
}
