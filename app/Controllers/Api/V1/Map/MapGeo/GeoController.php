<?php

namespace App\Controllers\Api\V1\Map\MapGeo;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Libraries\Auth\CurrentUser;
use App\Libraries\Map\CepClient;
use App\Libraries\Map\GeoException;
use App\Libraries\Map\NominatimClient;
use App\Libraries\Map\OrsClient;
use App\Libraries\Map\Throttle;
use App\Models\V1\Map\MapManager\SqlTableModel as MapManagerModel;
use App\Services\V1\Map\MapRouteStops\Processor as StopsProcessor;
use App\Services\V1\Map\MapRoutes\Processor as RoutesProcessor;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Database;
use Config\Services;

/**
 * Proxy dos provedores de mapa (Nominatim, ViaCEP/BrasilAPI, OpenRouteService).
 *
 * NAO segue o conjunto padrao de 18/9 rotas — desvio sancionado, como o
 * db-schema e o Upload. Expoe apenas:
 *   GET  map-geo/status
 *   GET  map-geo/search?q=&limit=&country=
 *   GET  map-geo/reverse?lat=&lng=
 *   GET  map-geo/cep/{cep}[?refresh=1]
 *   POST map-geo/route   { profile?, coordinates: [[lng,lat],...], save? }
 *
 * Estende BaseResourceViewController so para reaproveitar o envelope de
 * resposta. 'jwtauth' por wildcard em Config/Filters.php; guest nao consulta
 * (protege a cota) e cada usuario tem teto por minuto (MapProviders).
 */
class GeoController extends BaseResourceViewController
{
    /**
     * GET map-geo/status — quais provedores estao prontos (a chave nunca aparece).
     */
    public function status(): ResponseInterface
    {
        try {
            $cfg = config('MapProviders');

            return $this->respondSuccess([
                'nominatim'          => ['configured' => true, 'url' => $cfg->nominatimUrl, 'contact' => $cfg->nominatimContact !== ''],
                'openrouteservice'   => ['configured' => (new OrsClient())->configured(), 'url' => $cfg->orsUrl],
                'cep'                => ['viacep' => $cfg->viaCepUrl, 'brasilapi' => $cfg->brasilApiUrl],
                'default_country'    => $cfg->defaultCountry,
                'user_limit_per_min' => $cfg->userLimitPerMinute,
                'max_route_points'   => $cfg->maxRoutePoints,
            ], 'Provedores de mapa');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * GET map-geo/search — endereco ou nome de rua para coordenada.
     */
    public function geocode(): ResponseInterface
    {
        try {
            $blocked = $this->guard();
            if ($blocked !== null) {
                return $blocked;
            }

            $input  = $this->request->getGet(['q', 'limit', 'country']);
            $errors = $this->validateInput($input, [
                'q'       => 'required|string|min_length[3]|max_length[200]',
                'limit'   => 'permit_empty|is_natural_no_zero|less_than_equal_to[10]',
                'country' => 'permit_empty|alpha|exact_length[2]',
            ]);

            if ($errors !== []) {
                return $this->respondValidationError($errors);
            }

            [$items, $cached] = (new NominatimClient())->search(
                trim((string) $input['q']),
                (int) ($input['limit'] ?: 5),
                $input['country'] ? strtolower((string) $input['country']) : null
            );

            return $this->respondSuccess(['items' => $items, 'count' => count($items), 'cached' => $cached], 'Busca de endereco');
        } catch (GeoException $e) {
            return $this->respondError($e->getMessage(), $e->httpStatus());
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * GET map-geo/reverse — coordenada para endereco.
     */
    public function reverse(): ResponseInterface
    {
        try {
            $blocked = $this->guard();
            if ($blocked !== null) {
                return $blocked;
            }

            $input  = $this->request->getGet(['lat', 'lng']);
            $errors = $this->validateInput($input, [
                'lat' => 'required|decimal|greater_than_equal_to[-90]|less_than_equal_to[90]',
                'lng' => 'required|decimal|greater_than_equal_to[-180]|less_than_equal_to[180]',
            ]);

            if ($errors !== []) {
                return $this->respondValidationError($errors);
            }

            [$items, $cached] = (new NominatimClient())->reverse((float) $input['lat'], (float) $input['lng']);

            if ($items === []) {
                return $this->respondNotFound('Nenhum endereco encontrado para a coordenada');
            }

            return $this->respondSuccess(['item' => $items[0], 'cached' => $cached], 'Endereco da coordenada');
        } catch (GeoException $e) {
            return $this->respondError($e->getMessage(), $e->httpStatus());
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * GET map-geo/cep/{cep} — CEP para endereco + coordenada (grava map_postal_codes).
     */
    public function cep(string $cep = ''): ResponseInterface
    {
        try {
            $blocked = $this->guard();
            if ($blocked !== null) {
                return $blocked;
            }

            $digits = preg_replace('/\D/', '', $cep);

            if (strlen((string) $digits) !== 8) {
                return $this->respondValidationError(['cep' => 'CEP invalido: informe 8 digitos']);
            }

            [$row, $cached] = (new CepClient())->resolve($digits, (bool) $this->request->getGet('refresh'));

            return $this->respondSuccess(['item' => $row, 'cached' => $cached], 'CEP resolvido');
        } catch (GeoException $e) {
            return $this->respondError($e->getMessage(), $e->httpStatus());
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * POST map-geo/route — trajeto, distancia e tempo; `save` grava map_routes + map_route_stops.
     */
    public function route(): ResponseInterface
    {
        try {
            $blocked = $this->guard();
            if ($blocked !== null) {
                return $blocked;
            }

            $body    = $this->getJsonBody();
            $profile = (string) ($body['profile'] ?? 'driving-car');
            $cfg     = config('MapProviders');

            if (!in_array($profile, OrsClient::PROFILES, true)) {
                return $this->respondValidationError(['profile' => 'Use ' . implode(', ', OrsClient::PROFILES)]);
            }

            $coordinates = $this->parseCoordinates($body['coordinates'] ?? null, $cfg->maxRoutePoints);
            if (is_string($coordinates)) {
                return $this->respondValidationError(['coordinates' => $coordinates]);
            }

            $save = $body['save'] ?? null;
            if ($save !== null) {
                $saveError = $this->validateSave($save, $body['stops'] ?? null, count($coordinates));
                if ($saveError !== null) {
                    return $saveError;
                }
            }

            [$result, $cached] = (new OrsClient())->directions($profile, $coordinates);
            $result['cached']  = $cached;

            if ($save !== null) {
                $saved = $this->saveRoute($result, $coordinates, $save, $body['stops'] ?? []);

                if ($saved['error'] !== null) {
                    return $this->respondError($saved['error'], $saved['code']);
                }

                $result['saved'] = $saved;
                unset($result['saved']['error'], $result['saved']['code']);

                return $this->respondCreated($result, 'Trajeto calculado e gravado');
            }

            return $this->respondSuccess($result, 'Trajeto calculado');
        } catch (GeoException $e) {
            return $this->respondError($e->getMessage(), $e->httpStatus());
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    /**
     * Guest nao consulta; teto de consultas por usuario por minuto.
     */
    private function guard(): ?ResponseInterface
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->respondError('Operacao nao permitida para este usuario', 403);
        }

        $limit = config('MapProviders')->userLimitPerMinute;

        if (!Throttle::allowUser((int) CurrentUser::id(), $limit)) {
            return $this->respondError('Limite de ' . $limit . ' consultas por minuto atingido', 429);
        }

        return null;
    }

    /**
     * @param array<string, mixed> $data
     * @param array<string, string> $rules
     *
     * @return array<string, string>
     */
    private function validateInput(array $data, array $rules): array
    {
        $validation = Services::validation(null, false);
        $validation->setRules($rules);
        $validation->run($data);

        return $validation->getErrors();
    }

    /**
     * Aceita [lng, lat] ou {lat, lng}; devolve lista de [lng, lat] ou a mensagem de erro.
     *
     * @return list<array{0: float, 1: float}>|string
     */
    private function parseCoordinates(mixed $raw, int $max): array|string
    {
        if (!is_array($raw) || count($raw) < 2 || count($raw) > $max) {
            return 'Informe de 2 a ' . $max . ' pontos';
        }

        $out = [];

        foreach (array_values($raw) as $point) {
            if (is_array($point) && isset($point['lat'], $point['lng'])) {
                $lat = $point['lat'];
                $lng = $point['lng'];
            } elseif (is_array($point) && count($point) === 2 && array_is_list($point)) {
                [$lng, $lat] = $point;
            } else {
                return 'Cada ponto deve ser [lng, lat] ou {lat, lng}';
            }

            if (!is_numeric($lat) || !is_numeric($lng) || abs((float) $lat) > 90 || abs((float) $lng) > 180) {
                return 'Coordenada fora da faixa (lat -90..90, lng -180..180)';
            }

            $out[] = [(float) $lng, (float) $lat];
        }

        return $out;
    }

    private function validateSave(mixed $save, mixed $stops, int $points): ?ResponseInterface
    {
        if (!is_array($save)) {
            return $this->respondValidationError(['save' => 'Informe {map_manager_id, name}']);
        }

        $errors = $this->validateInput($save, [
            'map_manager_id' => 'required|is_natural_no_zero',
            'name'           => 'required|string|max_length[255]',
        ]);

        if ($errors !== []) {
            return $this->respondValidationError($errors);
        }

        if ((new MapManagerModel())->find((int) $save['map_manager_id']) === null) {
            return $this->respondNotFound('Mapa nao encontrado');
        }

        if ($stops !== null && (!is_array($stops) || count($stops) > $points)) {
            return $this->respondValidationError(['stops' => 'Informe no maximo um item por ponto']);
        }

        return null;
    }

    /**
     * Grava map_routes + map_route_stops numa transacao pelos Processors existentes.
     *
     * @param array<string, mixed> $result
     * @param list<array{0: float, 1: float}> $coordinates
     * @param array<string, mixed> $save
     * @param array<int, mixed> $stops
     *
     * @return array<string, mixed>
     */
    private function saveRoute(array $result, array $coordinates, array $save, array $stops): array
    {
        $db = Database::connect(DB_GROUP_001);
        $db->transBegin();

        $route = (new RoutesProcessor())->create([
            'map_manager_id' => (int) $save['map_manager_id'],
            'name'           => (string) $save['name'],
            'profile'        => $result['profile'],
            'distance_m'     => $result['distance_m'],
            'duration_s'     => $result['duration_s'],
            'geometry'       => json_encode($result['geometry'], JSON_UNESCAPED_SLASHES),
            'bbox'           => $result['bbox'],
            'provider'       => 'ors',
            'calculated_at'  => date('Y-m-d H:i:s'),
        ]);

        if (!$route['success']) {
            $db->transRollback();

            return ['error' => $route['message'] ?? 'Erro ao gravar o trajeto', 'code' => (int) ($route['code'] ?? 500)];
        }

        $stopIds   = [];
        $processor = new StopsProcessor();

        foreach ($coordinates as $i => [$lng, $lat]) {
            $extra = is_array($stops[$i] ?? null) ? $stops[$i] : [];
            $leg   = $i > 0 ? ($result['legs'][$i - 1] ?? null) : null;

            $payload = [
                'map_route_id' => (int) $route['data']['id'],
                'lat'          => $lat,
                'lng'          => $lng,
                'sort_order'   => $i + 1,
            ];

            foreach (['label', 'map_point_id', 'map_address_id'] as $field) {
                if (isset($extra[$field]) && $extra[$field] !== '') {
                    $payload[$field] = $extra[$field];
                }
            }

            if ($leg !== null) {
                $payload['leg_distance_m'] = $leg['distance_m'];
                $payload['leg_duration_s'] = $leg['duration_s'];
            }

            $stop = $processor->create($payload);

            if (!$stop['success']) {
                $db->transRollback();

                return ['error' => $stop['message'] ?? 'Erro ao gravar a parada', 'code' => (int) ($stop['code'] ?? 500)];
            }

            $stopIds[] = (int) $stop['data']['id'];
        }

        $db->transCommit();

        return ['error' => null, 'code' => 201, 'route_id' => (int) $route['data']['id'], 'stop_ids' => $stopIds];
    }
}
