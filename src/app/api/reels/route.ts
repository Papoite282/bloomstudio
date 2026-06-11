import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  DURATION_OPTIONS,
  LANGUAGE_OPTIONS,
  OBJECTIVE_OPTIONS,
  STYLE_OPTIONS,
  TEMPLATE_OPTIONS,
  isAllowedValue,
} from "@/lib/reel-form-options";
import {
  prepareUpload,
  removeProjectUploads,
  savePreparedUpload,
  validateUploadFile,
} from "@/lib/media-storage";

export const runtime = "nodejs";

type ValidatedForm = {
  title: string;
  objective: string;
  style: string;
  template: string;
  duration: number;
  language: string;
  files: File[];
};

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse("O formulário enviado não é válido.", 400);
  }

  const validation = validateReelForm(formData);

  if ("error" in validation) {
    return errorResponse(validation.error, 400);
  }

  let projectId: string | null = null;

  try {
    const project = await prisma.reelProject.create({
      data: {
        title: validation.title,
        objective: validation.objective,
        style: validation.style,
        template: validation.template,
        duration: validation.duration,
        language: validation.language,
        status: "draft",
      },
      select: { id: true },
    });

    projectId = project.id;

    const preparedUploads = validation.files.map((file, index) =>
      prepareUpload(file, project.id, index),
    );

    for (const upload of preparedUploads) {
      await savePreparedUpload(upload);
    }

    await prisma.mediaAsset.createMany({
      data: preparedUploads.map((upload) => ({
        reelProjectId: project.id,
        type: upload.type,
        originalName: upload.originalName,
        path: upload.relativePath,
        order: upload.order,
      })),
    });

    return NextResponse.json(
      {
        id: project.id,
        redirectTo: `/reels/${project.id}`,
      },
      { status: 201 },
    );
  } catch (error) {
    if (projectId) {
      await prisma.reelProject
        .delete({ where: { id: projectId } })
        .catch(() => {
          return null;
        });

      await removeProjectUploads(projectId);
    }

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Não foi possível criar o projeto. Tenta novamente.",
      500,
    );
  }
}

function validateReelForm(
  formData: FormData,
): ValidatedForm | { error: string } {
  const title = getTextValue(formData, "title");
  const objective = getTextValue(formData, "objective");
  const style = getTextValue(formData, "style");
  const template = getTextValue(formData, "template");
  const durationValue = getTextValue(formData, "duration");
  const language = getTextValue(formData, "language");

  if (!title || title.length < 2) {
    return { error: "Adiciona um título para o projeto." };
  }

  if (!isAllowedValue(objective, OBJECTIVE_OPTIONS)) {
    return { error: "Escolhe um objetivo válido para o reel." };
  }

  if (!isAllowedValue(style, STYLE_OPTIONS)) {
    return { error: "Escolhe um estilo visual válido." };
  }

  if (!isAllowedValue(template, TEMPLATE_OPTIONS)) {
    return { error: "Escolhe um template válido." };
  }

  const duration = Number(durationValue);

  if (
    !DURATION_OPTIONS.includes(duration as (typeof DURATION_OPTIONS)[number])
  ) {
    return { error: "Escolhe uma duração válida." };
  }

  if (!isAllowedValue(language, LANGUAGE_OPTIONS)) {
    return { error: "Escolhe um idioma válido." };
  }

  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return { error: "Adiciona pelo menos uma imagem ou vídeo." };
  }

  for (const file of files) {
    const uploadValidation = validateUploadFile(file);

    if ("error" in uploadValidation) {
      return { error: uploadValidation.error };
    }
  }

  return {
    title,
    objective,
    style,
    template,
    duration,
    language,
    files,
  };
}

function getTextValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
