export const OBJECTIVE_OPTIONS = [
  "Mostrar processo artístico",
  "Promover print Etsy",
  "Sketchbook / passeio",
  "Antes e depois",
  "Bastidores",
  "Moodboard artístico",
] as const;

export const STYLE_OPTIONS = [
  "Botanical",
  "Cottagecore",
  "Minimalista",
  "Soft aesthetic",
  "Rustic",
  "Calm art diary",
] as const;

export const TEMPLATE_OPTIONS = [
  "Soft Art Reveal",
  "Sketchbook Diary",
  "From Blank to Bloom",
  "Etsy Print Promo",
] as const;

export const DURATION_OPTIONS = [7, 10, 15, 20, 30] as const;
export const LANGUAGE_OPTIONS = ["pt", "en"] as const;

export const ACCEPTED_FILE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "mp4",
  "mov",
] as const;

export const ACCEPTED_FILE_INPUT = ACCEPTED_FILE_EXTENSIONS.map(
  (extension) => `.${extension}`,
).join(",");

export const IMAGE_MAX_BYTES = 15 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;

export type MediaKind = "image" | "video";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov"]);

export function isAllowedValue<T extends readonly string[]>(
  value: string,
  options: T,
): value is T[number] {
  return options.includes(value as T[number]);
}

export function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  return extension;
}

export function getMediaKindFromExtension(extension: string): MediaKind | null {
  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  return null;
}

export function getUploadLimit(kind: MediaKind) {
  return kind === "image" ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFileBasics(file: {
  name: string;
  size: number;
}): { kind: MediaKind; extension: string } | { error: string } {
  const extension = getFileExtension(file.name);
  const kind = getMediaKindFromExtension(extension);

  if (!kind) {
    return {
      error: `O ficheiro ${file.name} não tem um formato aceite.`,
    };
  }

  const limit = getUploadLimit(kind);

  if (file.size > limit) {
    return {
      error: `${file.name} ultrapassa o limite de ${formatFileSize(limit)}.`,
    };
  }

  return { kind, extension };
}
