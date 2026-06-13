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

## Configuração de IA

BloomStudio pode gerar roteiros de reels com uma API externa ou, se não houver chave configurada, com um fallback local.

Cria um ficheiro `.env` a partir de `.env.example`:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
```

`OPENAI_API_KEY` é opcional. Sem essa chave, a aplicação continua a funcionar e gera roteiros localmente com base no projeto, template, estilo, idioma, duração e assets.

A chave fica apenas no backend, não é enviada para o frontend e não é guardada na base de dados.

## Criar um projeto de reel

1. Abre `http://localhost:3000/reels/new`.
2. Preenche o título, objetivo, estilo visual, template, duração e idioma.
3. Seleciona uma ou várias imagens ou vídeos.
4. Confirma os previews dos ficheiros.
5. Cria o projeto para abrir automaticamente a página de detalhe do reel.
6. Na página do projeto, usa `Gerar roteiro com IA` para criar hook, cenas, legenda, hashtags e sugestão de áudio.

## Gerar e editar o roteiro

Na página de detalhe de cada projeto, usa `Gerar roteiro com IA` para criar uma primeira versão do roteiro. O resultado inclui título sugerido, hook, timeline de cenas, legenda, hashtags e sugestão de áudio.

Depois de existir um roteiro, a área `Editor do Reel` permite ajustar a timeline antes da renderização:

- edita o título sugerido, hook, legenda, hashtags e sugestão de áudio;
- escolhe o asset usado em cada cena;
- altera duração, texto no ecrã, movimento e notas;
- adiciona, remove e reordena cenas;
- acompanha a duração total estimada do reel.

Usa `Guardar alterações` para persistir a timeline editada na base de dados local. Recarrega a página do projeto para confirmar que as alterações continuam guardadas.

## Gerar vídeo local

BloomStudio renderiza o reel localmente com FFmpeg. Os ficheiros não são enviados para cloud.

No Windows, instala o FFmpeg a partir de uma fonte oficial ou através de um gestor de pacotes como Winget:

```powershell
winget install Gyan.FFmpeg
```

Depois fecha e volta a abrir o terminal, e confirma que o comando está disponível:

```bash
ffmpeg -version
```

Para gerar o vídeo:

1. Abre um projeto em `http://localhost:3000/reels`.
2. Confirma que existem assets e um roteiro guardado.
3. Ajusta a timeline no `Editor do Reel`.
4. Usa `Guardar alterações`.
5. Clica em `Gerar vídeo`.
6. Quando o export terminar, usa o player HTML5 ou `Download MP4`.

Os vídeos exportados ficam em `storage/exports/{reelProjectId}/final.mp4`. Os ficheiros temporários ficam em `storage/tmp/{reelProjectId}/` durante a renderização e são limpos no fim sempre que possível.

Quando a timeline usa vídeos carregados, o BloomStudio limita a duração da cena, adapta o enquadramento para 1080x1920 e remove o áudio nesta fase.

Os exports de vídeo ficam fora do Git.

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

## Uploads Locais

Os ficheiros carregados ficam guardados localmente em `storage/uploads/{reelProjectId}/`.

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

Os ficheiros são mantidos apenas no ambiente local e não são enviados para cloud.

## Repositório

Repositório oficial: [Papoite282/bloomstudio](https://github.com/Papoite282/bloomstudio)
