# BloomStudio

BloomStudio é um estúdio criativo local para artistas criarem reels verticais para Instagram a partir de fotos e vídeos da sua arte.

O produto junta upload de media, direção criativa da marca, geração de roteiro, edição de timeline e export MP4 num fluxo calmo, visual e pensado para conteúdo artístico.

## Problema

Artistas independentes precisam transformar fotografias, vídeos de processo, mockups e detalhes da sua obra em reels consistentes sem depender de ferramentas pesadas, dispersas ou demasiado comerciais. BloomStudio organiza esse processo localmente e mantém a voz visual da marca durante todo o fluxo.

## Funcionalidades

- Dashboard interno com métricas, projetos recentes e atalhos principais.
- Biblioteca de projetos de reels com estados claros.
- Wizard para criar reels com objetivo, estilo, template, duração, idioma e uploads.
- Upload por drag & drop com previews antes de enviar.
- Adição de novas imagens ou vídeos a projetos existentes.
- Perfil de marca editável para orientar tom, cores, público e palavras a evitar.
- Templates criativos para arte botânica, sketchbook, processo e promoção suave de prints.
- Geração de roteiro com OpenAI API: hook, título sugerido, cenas, legenda, hashtags e sugestão de áudio.
- Fallback local quando a OpenAI API não está configurada, sem quota ou temporariamente indisponível.
- Editor de timeline com cenas, assets, duração, movimento, texto no ecrã e notas.
- Renderização local de vídeo vertical em MP4 com FFmpeg.
- Player HTML5 e download do ficheiro final.
- Aviso quando um vídeo exportado pode estar desatualizado depois de editar a timeline.

## Stack

- Next.js com App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- FFmpeg
- ESLint
- Prettier

## Arquitetura

- `src/app/` contém páginas e API routes.
- `src/components/` contém a UI reutilizável e os fluxos de reels.
- `src/lib/` concentra Prisma, prompts, templates, upload local, OpenAI e renderização.
- `prisma/` contém schema, migrations e seed.
- `storage/` é usado apenas localmente para uploads, temporários e exports.

## MVP Status

A versão MVP v1.0 inclui:

- upload local de imagens e vídeos
- roteiro com OpenAI API ou fallback local
- editor de timeline
- render MP4 local com FFmpeg
- player HTML5 e download
- settings da marca
- templates criativos
- drag & drop
- adição de assets a projetos existentes

## Fluxo da App

1. Define ou ajusta o perfil da marca em `/settings/brand`.
2. Cria um projeto em `/reels/new`.
3. Carrega fotografias ou vídeos da arte.
4. Escolhe um template criativo.
5. Gera um roteiro inicial.
6. Edita a timeline e guarda as alterações.
7. Exporta o vídeo final em MP4.

Também podes abrir um projeto existente e adicionar mais imagens ou vídeos sem recriar o reel. Os novos assets aparecem na galeria e ficam disponíveis nos selects das cenas.

## Setup Local

Instala dependências:

```bash
npm install
```

Cria o ficheiro de ambiente:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Aplica migrations e seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

Confirma FFmpeg, se quiseres exportar MP4:

```bash
ffmpeg -version
```

Arranca a app:

```bash
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Uploads

BloomStudio aceita upload por drag & drop e por seleção tradicional de ficheiros.

Formatos aceites:

- `jpg`
- `jpeg`
- `png`
- `webp`
- `mp4`
- `mov`

Limites:

- imagens até 15 MB
- vídeos até 200 MB

Na criação de um projeto, os ficheiros são adicionados em `/reels/new`. Num projeto existente, usa a área “Adicionar imagens ou vídeos ao projeto” em `/reels/{id}`.

## Timeline e Re-render

Quando alteras texto, duração, movimento ou assets de uma cena, a timeline fica com alterações por guardar. Ao clicar em “Gerar vídeo”, BloomStudio guarda a timeline automaticamente antes de renderizar.

Se já existir um MP4 antigo, a interface mostra um aviso de que o vídeo pode estar desatualizado. Gera novamente para aplicar as alterações ao MP4 final.

Cada render cria um novo ficheiro local e o player usa uma URL com versão para evitar cache do vídeo anterior.

## OpenAI API e Fallback Local

```env
OPENAI_API_KEY=
OPENAI_MODEL=
```

`OPENAI_API_KEY` é opcional. Sem chave válida, sem quota ou perante erro temporário, BloomStudio usa fallback local e continua funcional.

`OPENAI_MODEL` é opcional. Define um modelo disponível na tua conta quando quiseres usar geração externa de roteiros.

## Prisma

Aplicar migrations:

```bash
npx prisma migrate dev
```

Executar seed:

```bash
npx prisma db seed
```

Abrir Prisma Studio:

```bash
npx prisma studio
```

Também podes usar:

```bash
npm run prisma:seed
npm run prisma:studio
```

## FFmpeg

A exportação de vídeo usa FFmpeg instalado no sistema. No Windows, uma opção é instalar com Winget:

```powershell
winget install Gyan.FFmpeg
```

Depois confirma:

```bash
ffmpeg -version
```

Se FFmpeg não estiver disponível, a app mostra uma mensagem amigável e mantém o projeto guardado.

## Segurança e Armazenamento Local

- `.env` fica fora do Git.
- Uploads ficam em `storage/uploads/`.
- Exports ficam em `storage/exports/`.
- Ficheiros temporários ficam em `storage/tmp/`.
- A base SQLite local fica fora do Git.
- Ficheiros gerados permanecem locais e não são enviados para cloud.
- Chaves de API não são expostas no frontend nem guardadas na base de dados.
- As rotas de media e export resolvem ficheiros apenas dentro de `storage/`.

## Instruções de Demo

1. Corre `npm install`, `npx prisma migrate dev` e `npx prisma db seed`.
2. Confirma `ffmpeg -version`.
3. Corre `npm run dev` e abre `http://localhost:3000`.
4. Ajusta o perfil da marca em `/settings/brand`.
5. Cria um projeto em `/reels/new` com pelo menos duas imagens.
6. Gera o roteiro. Se a OpenAI API não estiver disponível, o fallback local mantém a demo funcional.
7. Edita uma cena da timeline, adiciona um novo asset ao projeto e cria uma nova cena com esse asset.
8. Clica em `Gerar vídeo`, confirma o player HTML5 e testa `Download MP4`.

## Comandos Úteis

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run prisma:seed
npm run prisma:studio
```

## Known limitations

- OpenAI depende de quota ativa e de um modelo válido configurado localmente.
- A renderização FFmpeg depende de FFmpeg instalado no sistema.
- A app ainda não tem autenticação.
- A app ainda usa SQLite e storage local.
- Uploads e exports não são sincronizados entre máquinas.
- O fallback local gera roteiros úteis, mas menos variados do que geração via OpenAI API.
- Produção exigiria Postgres, autenticação, storage externo e um worker dedicado para renderização.

## Roadmap

- Presets visuais adicionais para estilos de reels.
- Biblioteca de áudio e moods.
- Pré-visualização de timeline antes do render final.
- Export de múltiplos formatos sociais.
- Arquivo de legendas e hashtags favoritas.
- Gestão de projetos demo sem assets reais.

## Repositório

Repositório oficial: [Papoite282/bloomstudio](https://github.com/Papoite282/bloomstudio)
