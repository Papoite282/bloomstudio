import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { reelMotionSchema } from "@/lib/schemas/reelScriptSchema";

export const runtime = "nodejs";

const sceneUpdateSchema = z.object({
  order: z.coerce.number().int(),
  duration: z.coerce.number().positive("A duração da cena deve ser positiva."),
  assetIndex: z.coerce.number().int(),
  onScreenText: z.string().max(220),
  motion: reelMotionSchema,
  notes: z.string().max(1000),
});

const updateScriptSchema = z.object({
  title: z.string().trim().min(1, "Adiciona um título para o roteiro."),
  hook: z.string().trim().min(1, "Adiciona um hook para o roteiro."),
  caption: z.string().max(2200),
  hashtags: z.array(z.string()).default([]),
  audioSuggestion: z.string().nullable().optional(),
  scenes: z
    .array(sceneUpdateSchema)
    .min(1, "Mantém pelo menos uma cena na timeline.")
    .max(20, "A timeline pode ter no máximo 20 cenas."),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id?.trim()) {
    return errorResponse("Projeto de reel inválido.", 400);
  }

  const body = await request.json().catch(() => null);
  const parsedBody = updateScriptSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse(
      parsedBody.error.issues[0]?.message ?? "Dados do roteiro inválidos.",
      400,
    );
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
    return errorResponse(
      "Este projeto ainda não tem roteiro para editar.",
      404,
    );
  }

  const invalidScene = parsedBody.data.scenes.find(
    (scene) =>
      scene.assetIndex < 0 || scene.assetIndex >= project.mediaAssets.length,
  );

  if (invalidScene) {
    return errorResponse(
      `A cena ${invalidScene.order} precisa de um asset válido.`,
      400,
    );
  }

  const normalizedScenes = parsedBody.data.scenes.map((scene, index) => ({
    order: index + 1,
    duration: Number(scene.duration.toFixed(1)),
    assetIndex: scene.assetIndex,
    onScreenText: scene.onScreenText.trim(),
    motion: scene.motion,
    notes: scene.notes.trim(),
  }));
  const hashtags = normalizeHashtags(parsedBody.data.hashtags);
  const audioSuggestion = parsedBody.data.audioSuggestion?.trim() ?? "";

  const [savedScript] = await prisma.$transaction([
    prisma.reelScript.update({
      where: { reelProjectId: project.id },
      data: {
        title: parsedBody.data.title,
        hook: parsedBody.data.hook,
        caption: parsedBody.data.caption.trim(),
        hashtags: JSON.stringify(hashtags),
        audioSuggestion: audioSuggestion || null,
        scenesJson: JSON.stringify(normalizedScenes),
      },
    }),
    prisma.reelProject.update({
      where: { id: project.id },
      data: { status: "script_ready" },
    }),
  ]);

  return NextResponse.json({
    script: {
      id: savedScript.id,
      title: savedScript.title ?? parsedBody.data.title,
      hook: savedScript.hook,
      caption: savedScript.caption,
      hashtags,
      audioSuggestion: savedScript.audioSuggestion,
      scenes: normalizedScenes,
      generationSource: savedScript.generationSource === "ai" ? "ai" : "local",
    },
  });
}

function normalizeHashtags(hashtags: string[]) {
  const normalized = hashtags
    .map((hashtag) => hashtag.trim())
    .filter(Boolean)
    .map((hashtag) => (hashtag.startsWith("#") ? hashtag : `#${hashtag}`));

  return Array.from(new Set(normalized));
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
