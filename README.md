# BloomStudio

BloomStudio é um estúdio criativo local para artistas criarem reels verticais para Instagram a partir de fotos e vídeos da sua arte.

O produto junta upload de media, direção criativa da marca, geração de roteiro, edição de timeline e export MP4 num fluxo calmo, visual e pensado para conteúdo artístico.

## Problema

Artistas independentes precisam transformar fotografias, vídeos de processo, mockups e detalhes da sua obra em reels consistentes sem depender de ferramentas pesadas, dispersas ou demasiado comerciais. BloomStudio resolve esse fluxo localmente, com uma estética suave e com apoio opcional de IA para acelerar ideias sem perder a voz da marca.

## Funcionalidades

- Dashboard interno com métricas, projetos recentes e atalhos principais.
- Biblioteca de projetos de reels com estados claros.
- Wizard para criar reels com objetivo, estilo, template, duração, idioma e uploads.
- Perfil de marca editável para orientar tom, cores, público e palavras a evitar.
- Templates criativos premium para arte botânica, sketchbook, processo e promoção suave de prints.
- Geração de roteiro com hook, título sugerido, cenas, legenda, hashtags e sugestão de áudio.
- Fallback local quando a API externa não está disponível.
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

## Fluxo da App

1. Define ou ajusta o perfil da marca em `/settings/brand`.
2. Cria um projeto em `/reels/new`.
3. Carrega fotografias ou vídeos da arte.
4. Escolhe um template criativo.
5. Gera um roteiro inicial.
6. Edita a timeline e guarda as alterações.
7. Exporta o vídeo final em MP4.

## Como Correr Localmente

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Base de Dados

O projeto usa SQLite em desenvolvimento. Para aplicar migrations:

```bash
npx prisma migrate dev
```

Para executar o seed inicial da marca:

```bash
npx prisma db seed
```

Para abrir o Prisma Studio:

```bash
npx prisma studio
```

## Configuração OpenAI

BloomStudio pode gerar roteiros com uma API externa compatível com OpenAI. Cria um ficheiro `.env` a partir de `.env.example` e define:

```env
OPENAI_API_KEY=
OPENAI_MODEL=
```

A chave é usada apenas no backend. Sem chave válida, sem quota ou perante erro temporário, BloomStudio continua funcional através do fallback local.

## Fallback Local

O fallback local cria um roteiro baseado no projeto, assets, template escolhido e BrandProfile. Também respeita o tom da marca, o idioma, as cores, o público e a lista de palavras a evitar.

## FFmpeg

A exportação de vídeo usa FFmpeg instalado no sistema. No Windows, uma opção é instalar com Winget:

```powershell
winget install Gyan.FFmpeg
```

Depois confirma:

```bash
ffmpeg -version
```

## Segurança e Armazenamento Local

- `.env` fica fora do Git.
- Uploads ficam em `storage/uploads/`.
- Exports ficam em `storage/exports/`.
- Ficheiros temporários ficam em `storage/tmp/`.
- Os ficheiros gerados permanecem locais e não são enviados para cloud.
- Chaves de API não são expostas no frontend nem guardadas na base de dados.

## Roadmap

- Presets visuais adicionais para estilos de reels.
- Biblioteca de áudio e moods.
- Pré-visualização de timeline antes do render final.
- Export de múltiplos formatos sociais.
- Arquivo de legendas e hashtags favoritas.

## Repositório

Repositório oficial: [Papoite282/bloomstudio](https://github.com/Papoite282/bloomstudio)
