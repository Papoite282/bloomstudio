# BloomStudio

BloomStudio é um estúdio criativo local para artistas criarem reels verticais para Instagram a partir de fotos e vídeos da sua arte.

O produto junta upload de media, direção criativa da marca, geração de roteiro, edição de timeline e export MP4 num fluxo calmo, visual e pensado para conteúdo artístico.

## Problema

Artistas independentes precisam transformar fotografias, vídeos de processo, mockups e detalhes da sua obra em reels consistentes sem depender de ferramentas pesadas, dispersas ou demasiado comerciais. BloomStudio organiza esse processo localmente e mantém a voz visual da marca durante todo o fluxo.

## Funcionalidades

- Dashboard interno com métricas, projetos recentes e atalhos principais.
- Biblioteca de projetos de reels com estados claros.
- Wizard para criar reels com objetivo, estilo, template, duração, idioma e uploads.
- Perfil de marca editável para orientar tom, cores, público e palavras a evitar.
- Templates criativos para arte botânica, sketchbook, processo e promoção suave de prints.
- Geração de roteiro com hook, título sugerido, cenas, legenda, hashtags e sugestão de áudio.
- Fallback local quando a API externa não está configurada, sem quota ou temporariamente indisponível.
- Editor de timeline com cenas, assets, duração, movimento, texto no ecrã e notas.
- Renderização local de vídeo vertical em MP4 com FFmpeg.
- Player HTML5 e download do ficheiro final.

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

## Screenshots

Adiciona capturas reais quando preparares a apresentação pública:

- Dashboard com métricas e fluxo criativo.
- Wizard de criação de reel.
- Página de detalhe com roteiro, timeline e export.
- Settings da marca.

## Fluxo da App

1. Define ou ajusta o perfil da marca em `/settings/brand`.
2. Cria um projeto em `/reels/new`.
3. Carrega fotografias ou vídeos da arte.
4. Escolhe um template criativo.
5. Gera um roteiro inicial.
6. Edita a timeline e guarda as alterações.
7. Exporta o vídeo final em MP4.

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

## Variáveis de Ambiente

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

## Comandos Úteis

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run prisma:seed
npm run prisma:studio
```

## Limitações Conhecidas

- A edição de vídeo é local e depende de FFmpeg instalado.
- Uploads e exports não são sincronizados entre máquinas.
- O fallback local gera roteiros úteis, mas menos variados do que uma geração externa.
- A app não inclui autenticação nesta fase.
- O export atual é focado em MP4 vertical 1080x1920.

## Roadmap

- Presets visuais adicionais para estilos de reels.
- Biblioteca de áudio e moods.
- Pré-visualização de timeline antes do render final.
- Export de múltiplos formatos sociais.
- Arquivo de legendas e hashtags favoritas.
- Gestão de projetos demo sem assets reais.

## Repositório

Repositório oficial: [Papoite282/bloomstudio](https://github.com/Papoite282/bloomstudio)
