// Espelho de: app/Config/Routes/Api/v1/Form/FormManager/EndPointView.php
// Grupo: api/v1/form-manager-view  ->  Api\V1\Form\FormManager\ResourceViewController
//
// View view_form_manager (somente leitura) — 1 linha por campo, prefixos
// fm_/fg_/fr_/fc_. Usada pela pagina do construtor de formularios.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const formManagerView = createResource(API_GROUPS.formManagerView, 'v1', { mutations: false });

export default formManagerView;
