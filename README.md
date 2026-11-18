# Freitas Renovações

Website da Freitas Renovações, com prioridade ao telemóvel e animações controladas pelo scroll. Esta versão corresponde à V29 aprovada: hero com imagem em todo o ecrã, cabeçalho transparente, remodelação da casa de banho, montagem da cozinha, capítulos de projetos e rodapé oficial.

## Editar

[Editar no navegador](https://github.dev/hufimarques-web/Freitas-renovacoes-)

Para guardar alterações neste repositório é necessário iniciar sessão no GitHub e ter permissão de escrita. Outras pessoas podem criar uma cópia (fork) e propor as alterações por pull request.

[Contexto da conversa](https://chatgpt.com/s/cx_6afd9dea9aa48191bb8c5ff9fbc70b3b) — esta partilha é uma cópia de leitura. O botão **Continue in ChatGPT** permite usar esse contexto numa conversa própria; não edita a conversa original nem dá acesso aos ficheiros do computador.

## Executar localmente

Requisitos: Node.js 20 ou superior e npm.

```sh
npm ci
npm run build
npm run dev
```

Abrir `http://127.0.0.1:4173`. Depois de alterar o código, executar novamente `npm run build`.

A pasta `dist/` contém a versão estática pronta para alojamento. O repositório inclui o código e os recursos necessários; não configura publicação automática.

## Estrutura

- `app/page.tsx`: hero, navegação e composição da página.
- `app/globals.css`: estilos e adaptação ao telemóvel.
- `app/SpatialCopy.ts`: texto da hero atrás da ilha.
- `app/BathroomCutaway.tsx`: etapas da remodelação.
- `app/KitchenReveal.tsx`: montagem da cozinha.
- `app/ProjectShowcase.tsx`, `ProjectsData.ts` e `ProjectVisuals.ts`: capítulos e fotografias das obras.
- `app/OfficialFooter.tsx` e `FooterData.ts`: contactos e rodapé.
- `public/media/`: imagens e fotogramas das animações.
- `public/fonts/`: fontes e respetivas licenças.

As imagens conceptuais são identificadas como tal na interface. As fotografias das obras e o logótipo pertencem à Freitas Renovações. As fontes mantêm as licenças incluídas na pasta `public/fonts/`.
