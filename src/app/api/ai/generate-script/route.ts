import { NextResponse } from "next/server";
import type { BrandProfile, MediaAsset, ReelProject } from "@prisma/client";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { createFallbackReelScript } from "@/lib/fallback-reel-script";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import { buildReelPrompt } from "@/lib/prompts/reelPrompt";
import { prisma } from "@/lib/prisma";
import {
  reelScriptSchema,
  type ReelScriptOutput,
} from "@/lib/schemas/reelScriptSchema";

export const runtime = "nodejs";

const requestSchema = z.object({
  reelProjectId: z.string().min(1),
});

type GenerationSource = "ai" | "local";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedBody = requestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Pedido inválido para gerar roteiro." },
      { status: 400 },
    );
  }

  const project = await prisma.reelProject.findUnique({
    where: { id: parsedBody.data.reelProjectId },
    include: {
      mediaAssets: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Projeto de reel não encontrado." },
      { status: 404 },
    );
  }

  if (project.mediaAssets.length === 0) {
    return NextResponse.json(
      { error: "Adiciona assets antes de gerar um roteiro." },
      { status: 400 },
    );
  }

  const brandProfile = await prisma.brandProfile.findFirst({
    where: { name: "Bloommere" },
  });

  if (!brandProfile) {
    return NextResponse.json(
      { error: "Perfil de marca Bloommere não encontrado." },
      { status: 500 },
    );
  }

  await prisma.reelProject.update({
    where: { id: project.id },
    data: { status: "generating_script" },
  });

  try {
    const generated = await generateWithOpenAI({
      brandProfile,
      project,
      mediaAssets: project.mediaAssets,
    });

    const script = generated?.script
      ? generated
      : {
          script: createFallbackReelScript({
            brandProfile,
            project,
            mediaAssets: project.mediaAssets,
          }),
          source: "local" as GenerationSource,
        };

    const savedScript = await prisma.reelScript.upsert({
      where: { reelProjectId: project.id },
      create: {
        reelProjectId: project.id,
        title: script.script.title,
        hook: script.script.hook,
        caption: script.script.caption,
        hashtags: JSON.stringify(script.script.hashtags),
        audioSuggestion: script.script.audioSuggestion,
        scenesJson: JSON.stringify(script.script.scenes),
        generationSource: script.source,
      },
      update: {
        title: script.script.title,
        hook: script.script.hook,
        caption: script.script.caption,
        hashtags: JSON.stringify(script.script.hashtags),
        audioSuggestion: script.script.audioSuggestion,
        scenesJson: JSON.stringify(script.script.scenes),
        generationSource: script.source,
      },
    });

    await prisma.reelProject.update({
      where: { id: project.id },
      data: { status: "script_ready" },
    });

    return NextResponse.json({
      script: {
        id: savedScript.id,
        reelProjectId: savedScript.reelProjectId,
        title: savedScript.title ?? script.script.title,
        hook: savedScript.hook,
        caption: savedScript.caption,
        hashtags: script.script.hashtags,
        audioSuggestion: savedScript.audioSuggestion,
        scenes: script.script.scenes,
        generationSource: savedScript.generationSource as GenerationSource,
      },
    });
  } catch (error) {
    await prisma.reelProject.update({
      where: { id: project.id },
      data: { status: "failed" },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível gerar o roteiro.",
      },
      { status: 500 },
    );
  }
}

async function generateWithOpenAI({
  brandProfile,
  project,
  mediaAssets,
}: {
  brandProfile: BrandProfile;
  project: ReelProject;
  mediaAssets: MediaAsset[];
}): Promise<{ script: ReelScriptOutput; source: GenerationSource } | null> {
  const client = getOpenAIClient();

  if (!client) {
    return null;
  }

  try {
    const completion = await client.chat.completions.parse({
      model: getOpenAIModel(),
      messages: [
        {
          role: "system",
          content:
            "És uma diretora criativa para reels de arte. Responde apenas no formato JSON pedido.",
        },
        {
          role: "user",
          content: buildReelPrompt({
            brandProfile,
            project,
            mediaAssets,
          }),
        },
      ],
      response_format: zodResponseFormat(reelScriptSchema, "reel_script"),
    });

    const parsedScript = completion.choices[0]?.message.parsed;

    if (!parsedScript) {
      return null;
    }

    return {
      script: reelScriptSchema.parse(parsedScript),
      source: "ai",
    };
  } catch {
    return null;
  }
}
