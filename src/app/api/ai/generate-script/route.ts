import { NextResponse } from "next/server";
import type { BrandProfile, MediaAsset, ReelProject } from "@prisma/client";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { DEFAULT_BRAND_PROFILE } from "@/lib/brand-profile";
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
type GenerationAttempt =
  | {
      script: ReelScriptOutput;
      source: "ai";
      notice: null;
    }
  | {
      script: null;
      source: "local";
      notice: string;
    };

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

  const brandProfile =
    (await prisma.brandProfile.findFirst({
      orderBy: { createdAt: "asc" },
    })) ??
    (await prisma.brandProfile.create({
      data: DEFAULT_BRAND_PROFILE,
    }));

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
    const script = generated.script
      ? {
          script: generated.script,
          source: generated.source,
          notice: null,
        }
      : {
          script: createFallbackReelScript({
            brandProfile,
            project,
            mediaAssets: project.mediaAssets,
          }),
          source: "local" as GenerationSource,
          notice: generated.notice,
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
      notice: script.notice,
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
}): Promise<GenerationAttempt> {
  const client = getOpenAIClient();

  if (!client) {
    return {
      script: null,
      source: "local",
      notice:
        "Sem chave de API configurada; o BloomStudio usou o fallback local.",
    };
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
      return {
        script: null,
        source: "local",
        notice:
          "A geração externa não devolveu um roteiro válido; o BloomStudio usou o fallback local.",
      };
    }

    return {
      script: reelScriptSchema.parse(parsedScript),
      source: "ai",
      notice: null,
    };
  } catch (error) {
    return {
      script: null,
      source: "local",
      notice: getOpenAIFallbackNotice(error),
    };
  }
}

function getOpenAIFallbackNotice(error: unknown) {
  const details =
    typeof error === "object" && error
      ? (error as { code?: unknown; status?: unknown; type?: unknown })
      : null;
  const code = String(details?.code ?? "").toLowerCase();
  const type = String(details?.type ?? "").toLowerCase();
  const status =
    typeof details?.status === "number" ? details.status : undefined;

  if (status === 429 || code.includes("quota") || type.includes("quota")) {
    return "A API externa respondeu sem quota disponível; o BloomStudio usou o fallback local.";
  }

  if (status === 401 || status === 403) {
    return "A chave da API externa não foi aceite; o BloomStudio usou o fallback local.";
  }

  if (status === 400 || status === 404) {
    return "O modelo configurado não respondeu como esperado; o BloomStudio usou o fallback local.";
  }

  return "A geração externa falhou temporariamente; o BloomStudio usou o fallback local.";
}
