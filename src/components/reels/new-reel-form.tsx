"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Film,
  ImageIcon,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ACCEPTED_FILE_INPUT,
  DURATION_OPTIONS,
  LANGUAGE_OPTIONS,
  MAX_FILES_PER_PROJECT,
  OBJECTIVE_OPTIONS,
  STYLE_OPTIONS,
  TEMPLATE_OPTIONS,
  formatFileSize,
  validateFileBasics,
} from "@/lib/reel-form-options";
import { REEL_TEMPLATES, getTemplateByName } from "@/lib/reel-templates";

type PreviewFile = {
  id: string;
  file: File;
  name: string;
  size: string;
  type: "image" | "video" | "unknown";
  url: string;
  error?: string;
};

export function NewReelForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState<string>(OBJECTIVE_OPTIONS[0]);
  const [style, setStyle] = useState<string>(STYLE_OPTIONS[0]);
  const [template, setTemplate] = useState<string>(TEMPLATE_OPTIONS[0]);
  const [duration, setDuration] = useState(String(DURATION_OPTIONS[2]));
  const [language, setLanguage] = useState<string>(LANGUAGE_OPTIONS[0]);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewsRef = useRef<PreviewFile[]>([]);

  const validFiles = useMemo(
    () =>
      previews
        .filter((preview) => !preview.error)
        .map((preview) => preview.file),
    [previews],
  );
  const selectedTemplate = useMemo(
    () => getTemplateByName(template),
    [template],
  );

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((preview) =>
        URL.revokeObjectURL(preview.url),
      );
    };
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    setError(
      selectedFiles.length > MAX_FILES_PER_PROJECT
        ? `Seleciona no máximo ${MAX_FILES_PER_PROJECT} ficheiros por projeto.`
        : "",
    );
    setPreviews((currentPreviews) => {
      currentPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));

      return selectedFiles.map((file) => {
        const validation = validateFileBasics(file);
        const kind = "kind" in validation ? validation.kind : "unknown";

        return {
          id: `${file.name}-${file.lastModified}-${file.size}`,
          file,
          name: file.name,
          size: formatFileSize(file.size),
          type: kind,
          url: URL.createObjectURL(file),
          error: "error" in validation ? validation.error : undefined,
        };
      });
    });
  }

  function removePreview(id: string) {
    setPreviews((currentPreviews) => {
      const previewToRemove = currentPreviews.find(
        (preview) => preview.id === id,
      );

      if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove.url);
      }

      return currentPreviews.filter((preview) => preview.id !== id);
    });
  }

  function handleTemplateChange(value: string) {
    const nextTemplate = getTemplateByName(value);

    setTemplate(value);
    setDuration(String(nextTemplate.suggestedDuration));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Adiciona um título ao projeto.");
      return;
    }

    if (previews.length === 0) {
      setError("Adiciona pelo menos uma imagem ou vídeo.");
      return;
    }

    if (previews.length > MAX_FILES_PER_PROJECT) {
      setError(
        `Seleciona no máximo ${MAX_FILES_PER_PROJECT} ficheiros por projeto.`,
      );
      return;
    }

    if (previews.some((preview) => preview.error)) {
      setError("Remove os ficheiros com erro antes de criar o projeto.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("objective", objective);
    formData.append("style", style);
    formData.append("template", template);
    formData.append("duration", duration);
    formData.append("language", language);

    validFiles.forEach((file) => {
      formData.append("files", file);
    });

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reels", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => null)) as {
        id?: string;
        redirectTo?: string;
        error?: string;
      } | null;

      if (!response.ok || !data?.id) {
        setError(data?.error ?? "Não foi possível criar o projeto.");
        setIsSubmitting(false);
        return;
      }

      router.push(data.redirectTo ?? `/reels/${data.id}`);
      router.refresh();
    } catch {
      setError(
        "Não foi possível criar o projeto. Verifica os ficheiros e tenta novamente.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Card className="space-y-5 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-bloom-sage text-bloom-ink">
              <ImageIcon aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-3xl text-bloom-ink">
                Origem visual
              </h2>
              <p className="text-sm text-bloom-ink/55">
                Material base, intenção e assets do projeto.
              </p>
            </div>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-bloom-ink">
              Título do projeto
            </span>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex. Coleção primavera calma"
              required
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-bloom-ink">
                Objetivo do reel
              </span>
              <Select
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
              >
                {OBJECTIVE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-bloom-ink">
                Estilo visual
              </span>
              <Select
                value={style}
                onChange={(event) => setStyle(event.target.value)}
              >
                {STYLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-bloom-ink">
                Template
              </span>
              <Select
                value={template}
                onChange={(event) => handleTemplateChange(event.target.value)}
              >
                {REEL_TEMPLATES.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-bloom-ink">
                Duração
              </span>
              <Select
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} segundos
                  </option>
                ))}
              </Select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-bloom-ink">Idioma</span>
              <Select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.toUpperCase()}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </Card>

        <Card className="space-y-5 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-bloom-blush/30 text-bloom-ink">
              <Film aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-3xl text-bloom-ink">
                Fotos e vídeos
              </h2>
              <p className="text-sm text-bloom-ink/55">
                JPG, PNG, WEBP, MP4 e MOV. Imagens até 15 MB e vídeos até 200
                MB.
              </p>
            </div>
          </div>

          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-bloom-olive/35 bg-bloom-cream/65 px-5 py-8 text-center transition hover:border-bloom-olive hover:bg-bloom-sage/20">
            <Upload aria-hidden className="h-8 w-8 text-bloom-olive" />
            <span className="mt-3 font-medium text-bloom-ink">
              Escolher ficheiros
            </span>
            <span className="mt-1 text-sm text-bloom-ink/55">
              Seleciona uma ou várias imagens e vídeos
            </span>
            <input
              className="sr-only"
              type="file"
              name="files"
              accept={ACCEPTED_FILE_INPUT}
              multiple
              onChange={handleFileChange}
            />
          </label>

          {previews.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {previews.map((preview, index) => (
                <div
                  key={preview.id}
                  className="overflow-hidden rounded-lg border border-bloom-olive/15 bg-bloom-porcelain"
                >
                  <div className="aspect-[4/3] bg-bloom-cream">
                    {preview.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="h-full w-full object-cover"
                      />
                    ) : preview.type === "video" ? (
                      <video
                        src={preview.url}
                        className="h-full w-full object-cover"
                        controls
                        muted
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-bloom-ink/50">
                        Preview indisponível
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-bloom-ink">
                        {index + 1}. {preview.name}
                      </p>
                      <p className="mt-1 text-xs text-bloom-ink/50">
                        {preview.size}
                      </p>
                      {preview.error ? (
                        <p className="mt-2 text-xs leading-5 text-red-700">
                          {preview.error}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePreview(preview.id)}
                      aria-label={`Remover ${preview.name}`}
                      title={`Remover ${preview.name}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-bloom-olive/20 text-bloom-ink transition hover:bg-bloom-cream"
                    >
                      <X aria-hidden className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href="/reels"
            className={buttonStyles({ variant: "secondary" })}
          >
            Ver biblioteca
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight aria-hidden className="h-4 w-4" />
            )}
            Criar projeto
          </Button>
        </div>
      </form>

      <aside className="space-y-4">
        <Card className="overflow-hidden">
          <div className="border-b border-bloom-olive/15 bg-bloom-ink px-5 py-4 text-bloom-cream">
            <div className="flex items-center gap-2">
              <Sparkles aria-hidden className="h-4 w-4" />
              <p className="text-sm font-medium">Preview do plano</p>
            </div>
          </div>
          <div className="space-y-5 p-5">
            <div className="mx-auto aspect-[9/16] w-full max-w-64 rounded-lg border border-bloom-olive/18 bg-bloom-cream p-4 shadow-inner">
              <div className="h-full rounded-md bg-[linear-gradient(180deg,#fffaf2,#c4ccb6_56%,#23211e)] p-3">
                <div className="flex h-full flex-col justify-between rounded-md border border-white/35 p-3">
                  <span className="h-2 w-16 rounded bg-white/70" />
                  <div className="space-y-2">
                    <span className="block h-2 w-28 rounded bg-white/70" />
                    <span className="block h-2 w-20 rounded bg-white/50" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-bloom-cream/70 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                  Estrutura
                </p>
                <p className="mt-2 text-sm leading-6 text-bloom-ink/70">
                  {selectedTemplate.description}
                </p>
              </div>
              <div className="rounded-lg bg-bloom-cream/70 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                  Melhor para
                </p>
                <p className="mt-2 text-sm leading-6 text-bloom-ink/70">
                  {selectedTemplate.bestFor}
                </p>
              </div>
              <div className="rounded-lg bg-bloom-cream/70 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                  Ritmo sugerido
                </p>
                <p className="mt-2 text-sm leading-6 text-bloom-ink/70">
                  {duration}s em {language.toUpperCase()} ·{" "}
                  {selectedTemplate.defaultMotion.replaceAll("_", " ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedTemplate.moodKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-md border border-bloom-olive/15 bg-bloom-porcelain px-2 py-1 text-xs text-bloom-ink/62"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-bloom-cream/70 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                  Assets
                </p>
                <p className="mt-2 text-sm leading-6 text-bloom-ink/70">
                  {validFiles.length === 0
                    ? "Os previews aparecem aqui antes do upload."
                    : `${validFiles.length} ficheiros prontos para criar.`}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </aside>
    </section>
  );
}
