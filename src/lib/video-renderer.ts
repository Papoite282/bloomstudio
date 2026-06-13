import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import type { MediaAsset, ReelProject } from "@prisma/client";

import { resolveStoredMediaPath, STORAGE_ROOT } from "@/lib/media-storage";
import type { ReelSceneOutput } from "@/lib/schemas/reelScriptSchema";

export const FFMPEG_NOT_FOUND_MESSAGE =
  'FFmpeg não foi encontrado. Instala o FFmpeg e garante que o comando "ffmpeg" está disponível no terminal.';

export const EXPORTS_ROOT = join(STORAGE_ROOT, "exports");
export const TMP_ROOT = join(STORAGE_ROOT, "tmp");

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const RESOLUTION = `${WIDTH}x${HEIGHT}`;

type RenderReelVideoInput = {
  exportFileName: string;
  project: ReelProject;
  mediaAssets: MediaAsset[];
  scenes: ReelSceneOutput[];
};

type RenderedVideo = {
  path: string;
  duration: number;
  resolution: typeof RESOLUTION;
};

class VideoRendererError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VideoRendererError";
  }
}

export async function ensureFfmpegAvailable() {
  await runFfmpeg(["-version"], FFMPEG_NOT_FOUND_MESSAGE);
}

export async function renderReelVideo({
  exportFileName,
  project,
  mediaAssets,
  scenes,
}: RenderReelVideoInput): Promise<RenderedVideo> {
  await ensureFfmpegAvailable();

  const projectTmpRoot = join(TMP_ROOT, project.id);
  const renderTmpRoot = join(projectTmpRoot, randomUUID());
  const exportPath = join(EXPORTS_ROOT, project.id, exportFileName);
  const totalDuration = scenes.reduce(
    (total, scene) => total + scene.duration,
    0,
  );

  await rm(projectTmpRoot, { force: true, recursive: true });
  await mkdir(renderTmpRoot, { recursive: true });
  await mkdir(dirname(exportPath), { recursive: true });

  try {
    const fontFilePath = await findFontFile();
    const sceneFiles: string[] = [];

    for (const [index, scene] of scenes.entries()) {
      const asset = mediaAssets[scene.assetIndex];

      if (!asset) {
        throw new VideoRendererError(
          `A cena ${scene.order} precisa de um asset válido.`,
        );
      }

      const inputPath = resolveStoredMediaPath(asset.path);

      if (!inputPath) {
        throw new VideoRendererError(
          `O asset da cena ${scene.order} não tem um caminho local válido.`,
        );
      }

      const sceneNumber = String(index + 1).padStart(3, "0");
      const textFilePath = join(renderTmpRoot, `scene-${sceneNumber}.txt`);
      const sceneOutputPath = join(renderTmpRoot, `scene-${sceneNumber}.mp4`);

      await writeFile(
        textFilePath,
        formatOverlayText(scene.onScreenText),
        "utf8",
      );

      await renderScene({
        asset,
        fontFilePath,
        inputPath,
        outputPath: sceneOutputPath,
        scene,
        textFilePath,
      });

      sceneFiles.push(sceneOutputPath);
    }

    const concatListPath = join(renderTmpRoot, "concat.txt");

    await writeFile(
      concatListPath,
      sceneFiles
        .map((filePath) => `file '${escapeConcatPath(filePath)}'`)
        .join("\n"),
      "utf8",
    );

    await runFfmpeg(
      [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListPath,
        "-c",
        "copy",
        "-movflags",
        "+faststart",
        exportPath,
      ],
      "Não foi possível juntar as cenas do reel.",
    );

    return {
      path: toStorageRelativePath(exportPath),
      duration: Math.round(totalDuration),
      resolution: RESOLUTION,
    };
  } finally {
    await rm(projectTmpRoot, { force: true, recursive: true }).catch(
      () => null,
    );
  }
}

export function resolveStoredExportPath(relativePath: string) {
  const normalizedPath = relativePath.replaceAll("\\", "/");
  const exportPrefix = "storage/exports/";

  if (
    !normalizedPath.startsWith(exportPrefix) ||
    normalizedPath.includes("../")
  ) {
    return null;
  }

  const exportRelativePath = normalizedPath.slice(exportPrefix.length);
  const resolvedPath = resolve(EXPORTS_ROOT, exportRelativePath);

  if (!isPathInside(EXPORTS_ROOT, resolvedPath)) {
    return null;
  }

  return resolvedPath;
}

async function renderScene({
  asset,
  fontFilePath,
  inputPath,
  outputPath,
  scene,
  textFilePath,
}: {
  asset: MediaAsset;
  fontFilePath: string | null;
  inputPath: string;
  outputPath: string;
  scene: ReelSceneOutput;
  textFilePath: string;
}) {
  const transformFilter =
    asset.type === "image"
      ? buildImageTransformFilter(scene)
      : buildVideoTransformFilter();
  const textFilter = buildTextFilter(textFilePath, fontFilePath);
  const filter = `${transformFilter},${textFilter},format=yuv420p`;
  const duration = formatDurationArgument(scene.duration);
  const frameCount = String(Math.max(1, Math.round(scene.duration * FPS)));
  const inputArgs =
    asset.type === "image"
      ? ["-loop", "1", "-i", inputPath]
      : ["-i", inputPath, "-t", duration];
  const frameLimitArgs =
    asset.type === "image" ? ["-frames:v", frameCount] : [];

  await runFfmpeg(
    [
      "-y",
      ...inputArgs,
      "-an",
      "-vf",
      filter,
      "-r",
      String(FPS),
      ...frameLimitArgs,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "20",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outputPath,
    ],
    `Não foi possível renderizar a cena ${scene.order}.`,
  );
}

function buildImageTransformFilter(scene: ReelSceneOutput) {
  const frames = Math.max(1, Math.round(scene.duration * FPS));
  const lastFrame = Math.max(1, frames - 1);

  if (scene.motion === "slow_zoom_in") {
    return [
      `scale=${WIDTH * 2}:${HEIGHT * 2}:force_original_aspect_ratio=increase`,
      `zoompan=z='min(zoom+0.0015\\,1.12)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${RESOLUTION}:fps=${FPS}`,
      "setsar=1",
      "setpts=PTS-STARTPTS",
    ].join(",");
  }

  if (scene.motion === "slow_zoom_out") {
    return [
      `scale=${WIDTH * 2}:${HEIGHT * 2}:force_original_aspect_ratio=increase`,
      `zoompan=z='if(eq(on\\,0)\\,1.12\\,max(1\\,zoom-0.0015))':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${RESOLUTION}:fps=${FPS}`,
      "setsar=1",
      "setpts=PTS-STARTPTS",
    ].join(",");
  }

  if (scene.motion === "pan_up" || scene.motion === "pan_down") {
    const progress =
      scene.motion === "pan_down" ? `n/${lastFrame}` : `(1-n/${lastFrame})`;

    return [
      `scale=${WIDTH}:${HEIGHT + 240}:force_original_aspect_ratio=increase`,
      `crop=${WIDTH}:${HEIGHT}:x='(iw-ow)/2':y='(ih-oh)*${progress}'`,
      "setsar=1",
      `fps=${FPS}`,
      "setpts=PTS-STARTPTS",
    ].join(",");
  }

  return buildVideoTransformFilter();
}

function buildVideoTransformFilter() {
  return [
    `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase`,
    `crop=${WIDTH}:${HEIGHT}`,
    "setsar=1",
    `fps=${FPS}`,
    "setpts=PTS-STARTPTS",
  ].join(",");
}

function buildTextFilter(textFilePath: string, fontFilePath: string | null) {
  const fontPart = fontFilePath
    ? `fontfile=${escapeFilterPath(fontFilePath)}:`
    : "";

  return [
    `drawtext=${fontPart}textfile=${escapeFilterPath(textFilePath)}`,
    "fontcolor=white",
    "fontsize=58",
    "line_spacing=10",
    "box=1",
    "boxcolor=black@0.48",
    "boxborderw=28",
    "x=(w-text_w)/2",
    "y=h-text_h-220",
  ].join(":");
}

async function runFfmpeg(args: string[], fallbackMessage: string) {
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const process = spawn("ffmpeg", args, { windowsHide: true });
    let output = "";

    function appendOutput(chunk: Buffer) {
      output = `${output}${chunk.toString("utf8")}`.slice(-8000);
    }

    process.stdout.on("data", appendOutput);
    process.stderr.on("data", appendOutput);
    process.on("error", (error: NodeJS.ErrnoException) => {
      rejectPromise(
        new VideoRendererError(
          error.code === "ENOENT" ? FFMPEG_NOT_FOUND_MESSAGE : fallbackMessage,
        ),
      );
    });
    process.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(
        new VideoRendererError(
          output.trim() ? `${fallbackMessage}` : fallbackMessage,
        ),
      );
    });
  });
}

function formatOverlayText(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "";
  }

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= 28) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;

    if (lines.length === 3) {
      break;
    }
  }

  if (currentLine && lines.length < 3) {
    lines.push(currentLine);
  }

  return lines.join("\n");
}

async function findFontFile() {
  const windowsRoot = process.env.SystemRoot ?? `C:${sep}Windows`;
  const candidates = [
    join(windowsRoot, "Fonts", "arial.ttf"),
    join(windowsRoot, "Fonts", "segoeui.ttf"),
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
  ];

  for (const candidate of candidates) {
    const exists = await access(candidate)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      return candidate;
    }
  }

  return null;
}

function toStorageRelativePath(absolutePath: string) {
  if (!isPathInside(STORAGE_ROOT, absolutePath)) {
    throw new VideoRendererError("Caminho de export inválido.");
  }

  return `storage/${relative(STORAGE_ROOT, absolutePath).replaceAll("\\", "/")}`;
}

function escapeFilterPath(filePath: string) {
  return `'${filePath
    .replaceAll("\\", "/")
    .replaceAll(":", "\\:")
    .replaceAll("'", "\\'")}'`;
}

function escapeConcatPath(filePath: string) {
  return filePath.replaceAll("\\", "/").replaceAll("'", "'\\''");
}

function formatDurationArgument(duration: number) {
  return Number.isInteger(duration) ? String(duration) : duration.toFixed(2);
}

function isPathInside(parentPath: string, childPath: string) {
  const relativePath = relative(parentPath, childPath);

  return (
    relativePath !== "" &&
    !relativePath.startsWith("..") &&
    !isAbsolute(relativePath)
  );
}
