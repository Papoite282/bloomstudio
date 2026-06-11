import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getContentTypeFromPath,
  readStoredMedia,
  resolveStoredMediaPath,
} from "@/lib/media-storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: {
      originalName: true,
      path: true,
    },
  });

  if (!asset || !resolveStoredMediaPath(asset.path)) {
    return NextResponse.json(
      { error: "Ficheiro não encontrado." },
      { status: 404 },
    );
  }

  const file = await readStoredMedia(asset.path).catch(() => null);

  if (!file) {
    return NextResponse.json(
      { error: "Ficheiro não encontrado." },
      { status: 404 },
    );
  }

  return new Response(new Uint8Array(file), {
    headers: {
      "Cache-Control": "private, max-age=3600",
      "Content-Length": String(file.byteLength),
      "Content-Type": getContentTypeFromPath(asset.path),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
