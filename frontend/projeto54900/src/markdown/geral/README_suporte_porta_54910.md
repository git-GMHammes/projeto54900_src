[◄ Índice da base de conhecimento](../README.md)

---

# Suporte — porta 54910 ocupada (Vite dev)

Erro: `Port 54910 is already in use`.

Causa: WSL em `networkingMode=mirrored` prende a porta; nenhum processo do Windows
aparece como dono.

Solução:

```powershell
wsl --shutdown
npm run dev
```

Efeito: derruba a `podman-machine-default` e os containers do projeto. Suba-os de
novo pelo Podman Desktop.

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
