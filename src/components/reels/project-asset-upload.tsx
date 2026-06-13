"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImagePlus, Loader2 } from "lucide-react";

import { FileDropzone, type FileDropzoneFile } from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MAX_FILES_PER_PROJECT } from "@/lib/reel-form-options";

type ProjectAssetUploadProps = {
  existingAssetCount: number;
  projectId: string;
};

export function ProjectAssetUpload({
  existingAssetCount,
  projectId,
}: ProjectAssetUploadProps) {
  const router = useRouter();
  const [files, setFiles] = useState<FileDropzoneFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const remainingSlots = Math.max(
    0,
    MAX_FILES_PER_PROJECT - existingAssetCount,
  );
  const validFiles = useMemo(
    () => files.filter((file) => !file.error).map((file) => file.file),
    [files],
  );
  const canUpload =
    remainingSlots > 0 &&
    files.length > 0 &&
    files.length <= remainingSlots &&
    !files.some((file) => file.error) &&
    !isUploading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (remainingSlots === 0) {
      setError(
        `Este projeto já tem o máximo de ${MAX_FILES_PER_PROJECT} ficheiros.`,
      );
      return;
    }

    if (files.length === 0) {
      setError("Adiciona pelo menos uma imagem ou vídeo.");
      return;
    }

    if (files.length > remainingSlots) {
      setError(
        `Podes adicionar mais ${remainingSlots} ficheiros a este projeto.`,
      );
      return;
    }

    if (files.some((file) => file.error)) {
      setError("Remove os ficheiros com erro antes de enviar.");
      return;
    }

    const formData = new FormData();

    validFiles.forEach((file) => {
      formData.append("files", file);
    });

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/reels/${projectId}/assets`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => null)) as {
        assets?: unknown[];
        error?: string;
      } | null;

      if (!response.ok || !data?.assets) {
        setError(data?.error ?? "Não foi possível adicionar os ficheiros.");
        return;
      }

      setFiles([]);
      setSuccess(
        data.assets.length === 1
          ? "1 ficheiro adicionado ao projeto."
          : `${data.assets.length} ficheiros adicionados ao projeto.`,
      );
      router.refresh();
    } catch {
      setError("Não foi possível adicionar os ficheiros. Tenta novamente.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="space-y-5 p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <ImagePlus aria-hidden className="h-4 w-4 text-bloom-olive" />
            <h2 className="font-serif text-3xl text-bloom-ink">
              Adicionar imagens ou vídeos ao projeto
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-bloom-ink/58">
            Os novos ficheiros ficam neste projeto, aparecem na galeria e podem
            ser escolhidos em qualquer cena da timeline.
          </p>
        </div>
        <span className="rounded-md border border-bloom-olive/16 bg-bloom-cream/70 px-3 py-2 text-xs text-bloom-ink/58">
          {remainingSlots} vagas disponíveis
        </span>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FileDropzone
          id="project-asset-files"
          files={files}
          maxFiles={remainingSlots}
          onFilesChange={(nextFiles) => {
            setFiles(nextFiles);
            setError("");
            setSuccess("");
          }}
          disabled={isUploading || remainingSlots === 0}
        />

        {success ? (
          <div className="flex items-start gap-2 rounded-lg border border-bloom-olive/25 bg-bloom-sage/35 px-4 py-3 text-sm text-bloom-ink">
            <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={!canUpload}>
            {isUploading ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus aria-hidden className="h-4 w-4" />
            )}
            Adicionar ao projeto
          </Button>
        </div>
      </form>
    </Card>
  );
}
