import { NextResponse } from "next/server";

import {
  prepareUpload,
  removeStoredMedia,
  savePreparedUpload,
  validateUploadFile,
  type PreparedUpload,
} from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";
import { MAX_FILES_PER_PROJECT } from "@/lib/reel-form-options";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id?.trim()) {
    return errorResponse("Projeto de reel inválido.", 400);
  }

  const project = await prisma.reelProject.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!project) {
    return errorResponse("Projeto de reel não encontrado.", 404);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse("O formulário enviado não é válido.", 400);
  }

  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return errorResponse("Adiciona pelo menos uma imagem ou vídeo.", 400);
  }

  const [assetCount, lastAsset] = await Promise.all([
    prisma.mediaAsset.count({ where: { reelProjectId: project.id } }),
    prisma.mediaAsset.findFirst({
      where: { reelProjectId: project.id },
      orderBy: { order: "desc" },
      select: { order: true },
    }),
  ]);

  if (assetCount + files.length > MAX_FILES_PER_PROJECT) {
    return errorResponse(
      `Este projeto pode ter no máximo ${MAX_FILES_PER_PROJECT} ficheiros.`,
      400,
    );
  }

  for (const file of files) {
    const validation = validateUploadFile(file);

    if ("error" in validation) {
      return errorResponse(validation.error, 400);
    }
  }

  const nextOrder = (lastAsset?.order ?? -1) + 1;
  const preparedUploads = files.map((file, index) =>
    prepareUpload(file, project.id, nextOrder + index),
  );
  const savedUploads: PreparedUpload[] = [];

  try {
    for (const upload of preparedUploads) {
      await savePreparedUpload(upload);
      savedUploads.push(upload);
    }

    const createdAssets = await prisma.$transaction(
      preparedUploads.map((upload) =>
        prisma.mediaAsset.create({
          data: {
            reelProjectId: project.id,
            type: upload.type,
            originalName: upload.originalName,
            path: upload.relativePath,
            order: upload.order,
          },
          select: {
            id: true,
            type: true,
            originalName: true,
            order: true,
            createdAt: true,
          },
        }),
      ),
    );

    return NextResponse.json({
      assets: createdAssets.map((asset) => ({
        id: asset.id,
        type: asset.type,
        originalName: asset.originalName,
        order: asset.order,
        createdAt: asset.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    await Promise.all(
      savedUploads.map((upload) => removeStoredMedia(upload.relativePath)),
    );

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Não foi possível adicionar os ficheiros ao projeto.",
      500,
    );
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
