# BloomStudio

BloomStudio é um estúdio criativo local para artistas prepararem reels verticais para Instagram a partir de fotos e vídeos da sua arte.

O produto organiza projetos, direção criativa, hooks, texto no ecrã, legendas e hashtags num fluxo simples e visual.

## Stack

- Next.js com App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- ESLint
- Prettier

## Como correr localmente

```bash
npm install
npx prisma migrate dev
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Base de dados

O projeto usa SQLite em desenvolvimento. A base local fica em `prisma/dev.db`
e é criada automaticamente durante `npm install` caso ainda não exista.

## Repositório

Repositório oficial: [Papoite282/bloomstudio](https://github.com/Papoite282/bloomstudio)
