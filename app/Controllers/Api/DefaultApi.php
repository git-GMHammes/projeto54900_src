<?php

namespace App\Controllers\Api;

use App\Controllers\Api\V1\BaseResourceViewController;
use CodeIgniter\HTTP\ResponseInterface;

class DefaultApi extends BaseResourceViewController
{
    public function index(): ResponseInterface
    {
        return $this->respondSuccess(new \stdClass());
    }
}
