"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Film, ImageIcon, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ACCEPTED_FILE_INPUT,
  MAX_FILES_PER_PROJECT,
  formatFileSize,
  validateFileBasics,
} from "@/lib/reel-form-options";

export type FileDropzoneFile = {
  id: string;
  file: File;
  name: string;
  size: string;
  type: "image" | "video" | "unknown";
  url: string;
  error?: string;
};

type FileDropzoneProps = {
  files: FileDropzoneFile[];
  onFilesChange: (files: FileDropzoneFile[]) => void;
  disabled?: boolean;
  id: string;
  maxFiles?: number;
};

export function FileDropzone({
  disabled = false,
  files,
  id,
  maxFiles = MAX_FILES_PER_PROJECT,
  onFilesChange,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previousFilesRef = useRef<FileDropzoneFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const previousFiles = previousFilesRef.current;
    const nextUrls = new Set(files.map((file) => file.url));

    previousFiles
      .filter((file) => !nextUrls.has(file.url))
      .forEach((file) => URL.revokeObjectURL(file.url));

    previousFilesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      previousFilesRef.current.forEach((file) => URL.revokeObjectURL(file.url));
    };
  }, []);

  function addFiles(fileList: FileList | File[]) {
    if (disabled) {
      return;
    }

    const selectedFiles = Array.from(fileList);
    const existingCount = files.length;
    const nextFiles = selectedFiles.map((file, index) =>
      createPreviewFile(file, existingCount + index, maxFiles),
    );

    onFilesChange([...files, ...nextFiles]);
  }

  function removeFile(idToRemove: string) {
    onFilesChange(files.filter((file) => file.id !== idToRemove));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLLabelElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    inputRef.current?.click();
  }

  return (
    <div className="space-y-4">
      <label
        htmlFor={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-5 py-8 text-center transition focus:outline-none focus:ring-2 focus:ring-bloom-olive/35",
          isDragging
            ? "border-bloom-olive bg-bloom-sage/30"
            : "border-bloom-olive/35 bg-bloom-cream/65 hover:border-bloom-olive hover:bg-bloom-sage/20",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <Upload aria-hidden className="h-8 w-8 text-bloom-olive" />
        <span className="mt-3 font-medium text-bloom-ink">
          Arrasta imagens ou vídeos para aqui
        </span>
        <span className="mt-1 text-sm text-bloom-ink/55">
          ou clica para selecionar ficheiros
        </span>
        <span className="mt-3 text-xs text-bloom-ink/45">
          Formatos aceites: JPG, PNG, WEBP, MP4 e MOV
        </span>
        <span className="mt-1 text-xs text-bloom-ink/45">
          As imagens ficam apenas no teu computador.
        </span>
        <input
          ref={inputRef}
          id={id}
          className="sr-only"
          type="file"
          name="files"
          accept={ACCEPTED_FILE_INPUT}
          multiple
          disabled={disabled}
          onChange={(event) => {
            addFiles(event.target.files ?? []);
            event.target.value = "";
          }}
        />
      </label>

      {files.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {files.map((file, index) => (
            <div
              key={file.id}
              className="overflow-hidden rounded-lg border border-bloom-olive/15 bg-bloom-porcelain"
            >
              <div className="aspect-[4/3] bg-bloom-cream">
                {file.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                ) : file.type === "video" ? (
                  <video
                    src={file.url}
                    className="h-full w-full object-cover"
                    controls
                    muted
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-bloom-ink/50">
                    <ImageIcon
                      aria-hidden
                      className="h-7 w-7 text-bloom-olive"
                    />
                    Preview indisponível
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {file.type === "video" ? (
                      <Film
                        aria-hidden
                        className="h-4 w-4 shrink-0 text-bloom-olive"
                      />
                    ) : (
                      <ImageIcon
                        aria-hidden
                        className="h-4 w-4 shrink-0 text-bloom-olive"
                      />
                    )}
                    <p className="truncate text-sm font-medium text-bloom-ink">
                      {index + 1}. {file.name}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-bloom-ink/50">{file.size}</p>
                  {file.error ? (
                    <p className="mt-2 text-xs leading-5 text-red-700">
                      {file.error}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  aria-label={`Remover ${file.name}`}
                  title={`Remover ${file.name}`}
                  disabled={disabled}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-bloom-olive/20 text-bloom-ink transition hover:bg-bloom-cream disabled:pointer-events-none disabled:opacity-50"
                >
                  <X aria-hidden className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function createPreviewFile(file: File, index: number, maxFiles: number) {
  const validation = validateFileBasics(file);
  const kind = "kind" in validation ? validation.kind : "unknown";
  const tooManyFiles =
    index >= maxFiles
      ? `Seleciona no máximo ${maxFiles} ficheiros por projeto.`
      : undefined;

  return {
    id: `${file.name}-${file.lastModified}-${file.size}-${index}`,
    file,
    name: file.name,
    size: formatFileSize(file.size),
    type: kind,
    url: URL.createObjectURL(file),
    error:
      tooManyFiles ?? ("error" in validation ? validation.error : undefined),
  } satisfies FileDropzoneFile;
}
