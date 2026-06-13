import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { reelSceneSchema } from "@/lib/schemas/reelScriptSchema";
import {
  FFMPEG_NOT_FOUND_MESSAGE,
  renderReelVideo,
} from "@/lib/video-renderer";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id?.trim()) {
    return errorResponse("Projeto de reel inválido.", 400);
  }

  const project = await prisma.reelProject.findUnique({
    where: { id },
    include: {
      mediaAssets: {
        orderBy: { order: "asc" },
      },
      script: true,
    },
  });

  if (!project) {
    return errorResponse("Projeto de reel não encontrado.", 404);
  }

  if (!project.script) {
    return errorResponse("Gera um roteiro antes de renderizar o vídeo.", 400);
  }

  if (project.mediaAssets.length === 0) {
    return errorResponse("Adiciona assets antes de renderizar o vídeo.", 400);
  }

  const parsedScenes = reelSceneSchema
    .array()
    .safeParse(safeJsonParse(project.script.scenesJson));

  if (!parsedScenes.success || parsedScenes.data.length === 0) {
    return errorResponse(
      "Guarda uma timeline válida antes de renderizar o vídeo.",
      400,
    );
  }

  const invalidScene = parsedScenes.data.find(
    (scene) =>
      scene.assetIndex < 0 || scene.assetIndex >= project.mediaAssets.length,
  );

  if (invalidScene) {
    return errorResponse(
      `A cena ${invalidScene.order} precisa de um asset válido antes da renderização.`,
      400,
    );
  }

  await prisma.reelProject.update({
    where: { id: project.id },
    data: { status: "rendering" },
  });

  try {
    const renderedVideo = await renderReelVideo({
      project,
      mediaAssets: project.mediaAssets,
      scenes: parsedScenes.data,
    });
    const existingExport = await prisma.reelExport.findFirst({
      where: {
        path: renderedVideo.path,
        reelProjectId: project.id,
      },
    });
    const savedExport = existingExport
      ? await prisma.reelExport.update({
          where: { id: existingExport.id },
          data: {
            duration: renderedVideo.duration,
            resolution: renderedVideo.resolution,
          },
        })
      : await prisma.reelExport.create({
          data: {
            reelProjectId: project.id,
            path: renderedVideo.path,
            duration: renderedVideo.duration,
            resolution: renderedVideo.resolution,
          },
        });

    await prisma.reelProject.update({
      where: { id: project.id },
      data: { status: "exported" },
    });

    return NextResponse.json({
      export: {
        id: savedExport.id,
        duration: savedExport.duration,
        resolution: savedExport.resolution,
        createdAt: savedExport.createdAt.toISOString(),
      },
      status: "exported",
    });
  } catch (error) {
    await prisma.reelProject.update({
      where: { id: project.id },
      data: { status: "failed" },
    });

    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível gerar o vídeo.";

    return errorResponse(
      message === FFMPEG_NOT_FOUND_MESSAGE
        ? FFMPEG_NOT_FOUND_MESSAGE
        : "Não foi possível gerar o vídeo. Confirma os assets e tenta novamente.",
      message === FFMPEG_NOT_FOUND_MESSAGE ? 503 : 500,
    );
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
