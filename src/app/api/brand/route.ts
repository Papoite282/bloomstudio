import { NextResponse } from "next/server";
import { z } from "zod";

import { DEFAULT_BRAND_PROFILE } from "@/lib/brand-profile";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const brandSchema = z.object({
  name: z.string().trim().min(1, "Adiciona o nome da marca."),
  description: z.string().trim().min(1, "Adiciona uma descrição da marca."),
  tone: z.string().trim().min(1, "Define o tom de voz da marca."),
  colors: z.string().trim().nullable().optional(),
  audience: z.string().trim().nullable().optional(),
  language: z.string().trim().min(2).max(8),
  wordsToAvoid: z.string().trim().nullable().optional(),
});

export async function GET() {
  const profile = await findOrCreateBrandProfile();

  return NextResponse.json({ brandProfile: profile });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedBody = brandSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error:
          parsedBody.error.issues[0]?.message ??
          "Não foi possível validar a marca.",
      },
      { status: 400 },
    );
  }

  const profile = await findOrCreateBrandProfile();
  const updatedProfile = await prisma.brandProfile.update({
    where: { id: profile.id },
    data: {
      name: parsedBody.data.name,
      description: parsedBody.data.description,
      tone: parsedBody.data.tone,
      colors: parsedBody.data.colors || null,
      audience: parsedBody.data.audience || null,
      language: parsedBody.data.language,
      wordsToAvoid: parsedBody.data.wordsToAvoid || null,
    },
  });

  return NextResponse.json({ brandProfile: updatedProfile });
}

async function findOrCreateBrandProfile() {
  const profile = await prisma.brandProfile.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (profile) {
    return profile;
  }

  return prisma.brandProfile.create({
    data: DEFAULT_BRAND_PROFILE,
  });
}
