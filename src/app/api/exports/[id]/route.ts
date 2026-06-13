import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveStoredExportPath } from "@/lib/video-renderer";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const reelExport = await prisma.reelExport.findUnique({
    where: { id },
    select: {
      path: true,
    },
  });

  if (!reelExport) {
    return errorResponse("Export não encontrado.", 404);
  }

  const filePath = resolveStoredExportPath(reelExport.path);

  if (!filePath) {
    return errorResponse("Export inválido.", 404);
  }

  const fileStats = await stat(filePath).catch(() => null);

  if (!fileStats?.isFile()) {
    return errorResponse("Ficheiro exportado não encontrado.", 404);
  }

  const range = request.headers.get("range");
  const fileSize = fileStats.size;
  const fileName = "bloomstudio-reel.mp4";

  if (range) {
    const rangeMatch = range.match(/bytes=(\d*)-(\d*)/);

    if (!rangeMatch) {
      return errorResponse("Range inválido.", 416);
    }

    const start = rangeMatch[1] ? Number(rangeMatch[1]) : 0;
    const end = rangeMatch[2]
      ? Number(rangeMatch[2])
      : Math.min(start + 1024 * 1024 - 1, fileSize - 1);

    if (start >= fileSize || end >= fileSize || start > end) {
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${fileSize}`,
        },
      });
    }

    const stream = createReadStream(filePath, { end, start });

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Type": "video/mp4",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const file = await readFile(filePath).catch(() => null);

  if (!file) {
    return errorResponse("Ficheiro exportado não encontrado.", 404);
  }

  return new Response(new Uint8Array(file), {
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Content-Length": String(file.byteLength),
      "Content-Type": "video/mp4",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
