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

## Comandos locais

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Base de Dados

O projeto usa SQLite em desenvolvimento. A base local fica em `prisma/dev.db` e é criada automaticamente durante `npm install` caso ainda não exista.

Para aplicar migrations:

```bash
npx prisma migrate dev
```

Para executar o seed inicial:

```bash
npx prisma db seed
```

Para abrir o Prisma Studio:

```bash
npx prisma studio
```

## Repositório

Repositório oficial: [Papoite282/bloomstudio](https://github.com/Papoite282/bloomstudio)
