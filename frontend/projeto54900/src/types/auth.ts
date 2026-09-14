// Tipos do modulo de autenticacao. Espelha o payload de
// Services/V1/Auth/AuthService.php (login/refresh/me).

export interface AuthRole {
  id: number;
  name: string;
  slug: string;
}

export interface AuthUser {
  id: number;
  username: string;
  status: string;
  last_login_at: string | null;
  role: AuthRole | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface AuthPayload extends AuthTokens {
  user: AuthUser | null;
}
