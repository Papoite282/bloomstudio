import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";

import {
  getFileExtension,
  getMediaKindFromExtension,
  validateFileBasics,
} from "@/lib/reel-form-options";

export const STORAGE_ROOT = join(process.cwd(), "storage");
export const UPLOADS_ROOT = join(STORAGE_ROOT, "uploads");

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  mov: "video/quicktime",
};

const MIME_ALLOWLIST: Record<string, Set<string>> = {
  jpg: new Set(["image/jpeg", "image/pjpeg"]),
  jpeg: new Set(["image/jpeg", "image/pjpeg"]),
  png: new Set(["image/png"]),
  webp: new Set(["image/webp"]),
  mp4: new Set(["video/mp4"]),
  mov: new Set(["video/quicktime", "video/mov", "video/x-quicktime"]),
};

export type PreparedUpload = {
  file: File;
  originalName: string;
  storedName: string;
  relativePath: string;
  type: "image" | "video";
  order: number;
};

export function validateUploadFile(file: File) {
  const basicValidation = validateFileBasics(file);

  if ("error" in basicValidation) {
    return basicValidation;
  }

  const allowedMimeTypes = MIME_ALLOWLIST[basicValidation.extension];

  if (
    file.type &&
    allowedMimeTypes &&
    !allowedMimeTypes.has(file.type.toLowerCase())
  ) {
    return {
      error: `O tipo do ficheiro ${file.name} não corresponde ao formato indicado.`,
    };
  }

  return basicValidation;
}

export function prepareUpload(file: File, projectId: string, order: number) {
  const validation = validateUploadFile(file);

  if ("error" in validation) {
    throw new Error(validation.error);
  }

  const safeName = createSafeFileName(file.name, validation.extension, order);

  return {
    file,
    originalName: file.name,
    storedName: safeName,
    relativePath: createRelativeUploadPath(projectId, safeName),
    type: validation.kind,
    order,
  } satisfies PreparedUpload;
}

export async function savePreparedUpload(upload: PreparedUpload) {
  const targetPath = resolveStoredMediaPath(upload.relativePath);

  if (!targetPath) {
    throw new Error("Caminho de upload inválido.");
  }

  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, Buffer.from(await upload.file.arrayBuffer()));
}

export async function removeProjectUploads(projectId: string) {
  const projectDirectory = resolve(UPLOADS_ROOT, projectId);

  if (!isPathInside(UPLOADS_ROOT, projectDirectory)) {
    return;
  }

  await rm(projectDirectory, { recursive: true, force: true });
}

export function resolveStoredMediaPath(relativePath: string) {
  const normalizedPath = relativePath.replaceAll("\\", "/");
  const uploadPrefix = "storage/uploads/";

  if (
    !normalizedPath.startsWith(uploadPrefix) ||
    normalizedPath.includes("../")
  ) {
    return null;
  }

  const uploadRelativePath = normalizedPath.slice(uploadPrefix.length);
  const resolvedPath = resolve(UPLOADS_ROOT, uploadRelativePath);

  if (!isPathInside(UPLOADS_ROOT, resolvedPath)) {
    return null;
  }

  return resolvedPath;
}

export async function readStoredMedia(relativePath: string) {
  const mediaPath = resolveStoredMediaPath(relativePath);

  if (!mediaPath) {
    return null;
  }

  return readFile(mediaPath);
}

export async function removeStoredMedia(relativePath: string) {
  const mediaPath = resolveStoredMediaPath(relativePath);

  if (!mediaPath) {
    return;
  }

  await rm(mediaPath, { force: true }).catch(() => null);
}

export function getContentTypeFromPath(filePath: string) {
  const extension = getFileExtension(filePath);

  return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}

export function getKindFromPath(filePath: string) {
  return getMediaKindFromExtension(getFileExtension(filePath));
}

function createRelativeUploadPath(projectId: string, fileName: string) {
  return `storage/uploads/${projectId}/${fileName}`;
}

function createSafeFileName(
  originalName: string,
  extension: string,
  order: number,
) {
  const originalBaseName = basename(originalName, extname(originalName));
  const cleanBaseName =
    originalBaseName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 56) || "asset";

  const prefix = String(order + 1).padStart(2, "0");
  const uniquePart = randomUUID().slice(0, 8);

  return `${prefix}-${uniquePart}-${cleanBaseName}.${extension}`;
}

function isPathInside(parentPath: string, childPath: string) {
  const relativePath = relative(parentPath, childPath);

  return (
    relativePath !== "" &&
    !relativePath.startsWith("..") &&
    !isAbsolute(relativePath)
  );
}
