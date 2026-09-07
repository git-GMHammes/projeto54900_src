# routes/v1a

Espelha o namespace **`Api\V1A`** do backend CodeIgniter (grupo `api/v1a` em
`app/Config/Routes.php`).

Hoje e apenas um stub (`VersionPlaceholderPage`). Quando o backend ganhar o
primeiro modulo em `api/v1a`:

1. Crie `routes/v1a/<modulo>.routes.jsx` no mesmo formato de
   `routes/v1/user.routes.jsx` (paths relativos ao pai `v1a`).
2. Importe e espalhe em `routes/v1a/index.jsx` (`children: [...<modulo>Routes]`).
3. Crie os services em `services/v1a/` chamando
   `createResource('<grupo>', 'v1a')`.
4. Adicione as paths em `routes/paths.js` sob a chave `v1a`.

O padrao de versao seco (`v1`, `v1a`, `v2`, ...) acompanha 1:1 a versao da API.
