const n=`[◄ Índice da base de conhecimento](../README.md)

---

# Suporte — porta 54910 ocupada (Vite dev)

Erro: \`Port 54910 is already in use\`.

Causa: WSL em \`networkingMode=mirrored\` prende a porta; nenhum processo do Windows
aparece como dono.

Solução:

\`\`\`powershell
wsl --shutdown
npm run dev
\`\`\`

Efeito: derruba a \`podman-machine-default\` e os containers do projeto. Suba-os de
novo pelo Podman Desktop.

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor\r
\r
| Campo               | Informação                                                                                                                   |\r
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |\r
| **Nome**            | Gustavo Hammes                                                                                                               |\r
| **Local**           | Rio de Janeiro                                                                                                               |\r
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |\r
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |\r
`;export{n as default};
