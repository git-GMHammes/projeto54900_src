<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;

class Home extends BaseController
{
    public function index(): string
    {
        return view('welcome_message');
    }

    // public function status(): ResponseInterface
    // {
    //     return $this->response->setJSON(['status' => 'ok']);
    // }
}
