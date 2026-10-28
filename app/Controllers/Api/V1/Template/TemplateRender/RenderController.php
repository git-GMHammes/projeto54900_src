<?php

namespace App\Controllers\Api\V1\Template\TemplateRender;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Libraries\Auth\CurrentUser;
use App\Services\V1\Template\TemplateRender\Builder;
use App\Services\V1\Template\TemplateRender\Preference;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Endpoint de leitura que entrega o template inteiro da empresa da sessao.
 *
 * NAO segue o conjunto padrao de rotas (18/9): e um desvio sancionado, como db-schema.
 * Expoe apenas:
 *   GET template-render/get[?temp_nav_id=]
 *   PUT template-render/preference   (template preferido do proprio usuario)
 *   GET template-public/get/{slug}   (PUBLICO: template padrao, cabecalhos e rodapes da empresa, para o visitante antes do login)
 *
 * Estende BaseResourceViewController so para reaproveitar os helpers de resposta
 * (respondSuccess / respondNotFound / respondServerError) e o envelope padrao.
 */
class RenderController extends BaseResourceViewController
{
    /**
     * GET template-render/get — nav, menu, cabecalhos e rodapes ativos da empresa da sessao,
     * no mesmo formato dos JSONs template00X.json.
     */
    public function render(): ResponseInterface
    {
        try {
            $navId = $this->request->getGet('temp_nav_id');
            $data  = (new Builder())->build($navId !== null && $navId !== '' ? (int) $navId : null);

            return $this->respondSuccess($data, 'Template carregado com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * PUT template-render/preference — body { "temp_manager_id": <id>|null }. Grava so a preferencia do
     * usuario da sessao; null volta ao automatico (menor id ativo da empresa).
     */
    public function preference(): ResponseInterface
    {
        try {
            $userId = CurrentUser::id();
            if ($userId === null) {
                return $this->respondError('Sessao invalida', 401);
            }

            $body = $this->request->getJSON(true);
            if (!is_array($body) || !array_key_exists('temp_manager_id', $body)) {
                return $this->respondValidationError(['temp_manager_id' => 'Campo obrigatorio (id do template ou null)']);
            }

            $raw = $body['temp_manager_id'];
            if ($raw !== null && $raw !== '' && (!is_numeric($raw) || (int) $raw < 1)) {
                return $this->respondValidationError(['temp_manager_id' => 'Informe o id do template ou null']);
            }
            $templateId = ($raw === null || $raw === '') ? null : (int) $raw;

            $result = (new Preference())->set($userId, $templateId);
            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code']);
            }

            return $this->respondSuccess((new Builder())->build()['template'], $result['message']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * GET template-public/get/{slug} — rota PUBLICA (sem 'jwtauth'): devolve o template padrao, os cabecalhos e os
     * rodapes ativos da empresa do slug, para a tela de login e demais telas de visitante. Nav, menu e a casca do
     * app (temp_nav) NAO saem por aqui.
     */
    public function publicTemplate(string $slug = ''): ResponseInterface
    {
        try {
            $slug = strtolower(trim($slug));
            if ($slug === '' || preg_match('/^[a-z0-9-]{1,100}$/', $slug) !== 1) {
                return $this->respondSuccess(['color_theme' => null, 'template' => null, 'headers' => [], 'footers' => []], 'Template indisponivel');
            }

            return $this->respondSuccess((new Builder())->publicContentOfSlug($slug), 'Template carregado com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
