"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clapperboard,
  Download,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  SceneEditor,
  type SceneEditorAsset,
  type SceneEditorHandle,
  type SceneEditorScript,
} from "@/components/SceneEditor";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStatusLabel, getStatusVariant } from "@/lib/status-labels";

export type StoredReelScript = SceneEditorScript;
export type StoredMediaAsset = SceneEditorAsset;
export type StoredReelExport = {
  id: string;
  duration: number | null;
  resolution: string;
  createdAt: string;
};

export function ScriptGenerationPanel({
  assets,
  initialExports,
  initialScript,
  projectDuration,
  projectId,
  projectStatus,
}: {
  projectId: string;
  projectDuration: number;
  projectStatus: string;
  assets: StoredMediaAsset[];
  initialExports: StoredReelExport[];
  initialScript: StoredReelScript | null;
}) {
  const router = useRouter();
  const sceneEditorRef = useRef<SceneEditorHandle | null>(null);
  const [script, setScript] = useState(initialScript);
  const [scriptVersion, setScriptVersion] = useState(0);
  const [exports, setExports] = useState(initialExports);
  const [status, setStatus] = useState(projectStatus);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isExportStale, setIsExportStale] = useState(false);
  const [error, setError] = useState("");
  const [generationNotice, setGenerationNotice] = useState(
    initialScript?.generationSource === "local"
      ? "Este roteiro foi criado localmente para manter o fluxo criativo disponível."
      : "",
  );
  const [renderError, setRenderError] = useState("");
  const [renderSuccess, setRenderSuccess] = useState("");
  const canGenerate = assets.length > 0;
  const canRender = Boolean(
    script &&
    script.scenes.length > 0 &&
    assets.length > 0 &&
    script.scenes.every(
      (scene) => scene.assetIndex >= 0 && scene.assetIndex < assets.length,
    ),
  );
  const latestExport = exports[0] ?? null;

  async function generateScript() {
    setIsGenerating(true);
    setError("");
    setGenerationNotice("");

    try {
      const response = await fetch("/api/ai/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reelProjectId: projectId }),
      });
      const data = (await response.json().catch(() => null)) as {
        script?: StoredReelScript;
        error?: string;
        notice?: string | null;
      } | null;

      if (!response.ok || !data?.script) {
        setError(data?.error ?? "Não foi possível gerar o roteiro.");
        setIsGenerating(false);
        return;
      }

      setScript(data.script);
      setScriptVersion((currentVersion) => currentVersion + 1);
      setHasUnsavedChanges(false);
      setIsExportStale(exports.length > 0);
      setGenerationNotice(
        data.notice ??
          (data.script.generationSource === "local"
            ? "Este roteiro foi criado localmente para manter o fluxo criativo disponível."
            : ""),
      );
      router.refresh();
    } catch {
      setError("Não foi possível gerar o roteiro. Tenta novamente.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleScriptSaved(updatedScript: StoredReelScript) {
    setScript(updatedScript);
    setScriptVersion((currentVersion) => currentVersion + 1);
    setHasUnsavedChanges(false);
    setIsExportStale(exports.length > 0);
    setRenderError("");
    setRenderSuccess("");
    setGenerationNotice("");
    router.refresh();
  }

  async function renderVideo() {
    setIsRendering(true);
    setStatus("rendering");
    setRenderError("");
    setRenderSuccess("");

    try {
      if (sceneEditorRef.current?.hasUnsavedChanges()) {
        setRenderSuccess("A guardar alterações antes de gerar o vídeo.");
        const savedScript = await sceneEditorRef.current.saveIfDirty();

        if (!savedScript) {
          setStatus("script_ready");
          setRenderSuccess("");
          setRenderError(
            "Não foi possível guardar a timeline antes de gerar o vídeo.",
          );
          return;
        }

        setScript(savedScript);
        setHasUnsavedChanges(false);
      }

      const response = await fetch(`/api/render/${projectId}`, {
        method: "POST",
      });
      const data = (await response.json().catch(() => null)) as {
        export?: StoredReelExport;
        status?: string;
        error?: string;
      } | null;

      if (!response.ok || !data?.export) {
        setStatus("failed");
        setRenderError(data?.error ?? "Não foi possível gerar o vídeo.");
        return;
      }

      setExports((currentExports) => [
        data.export as StoredReelExport,
        ...currentExports.filter((item) => item.id !== data.export?.id),
      ]);
      setStatus(data.status ?? "exported");
      setIsExportStale(false);
      setRenderSuccess("Vídeo exportado com sucesso.");
      router.refresh();
    } catch {
      setStatus("failed");
      setRenderError("Não foi possível gerar o vídeo. Tenta novamente.");
    } finally {
      setIsRendering(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge variant="cream">Roteiro</Badge>
          <h2 className="mt-3 font-serif text-4xl text-bloom-ink">
            Roteiro do reel
          </h2>
          {script ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge
                variant={script.generationSource === "ai" ? "dark" : "olive"}
              >
                {script.generationSource === "ai"
                  ? "Gerado com IA"
                  : "Gerado localmente"}
              </Badge>
              <Badge variant={getStatusVariant(status)}>
                {getStatusLabel(status)}
              </Badge>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={generateScript}
            disabled={!canGenerate || isGenerating}
            title={
              canGenerate
                ? "Gerar roteiro com apoio externo ou fallback local"
                : "Adiciona pelo menos um asset antes de gerar o roteiro"
            }
          >
            {isGenerating ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles aria-hidden className="h-4 w-4" />
            )}
            Gerar roteiro com IA
          </Button>
          <Button
            onClick={renderVideo}
            disabled={!canRender || isRendering}
            variant="secondary"
            title={
              canRender
                ? "Guardar alterações pendentes e gerar vídeo MP4 local"
                : "Garante que a timeline tem cenas e assets válidos antes de renderizar"
            }
          >
            {isRendering ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Clapperboard aria-hidden className="h-4 w-4" />
            )}
            Gerar vídeo
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {generationNotice ? (
        <StatusMessage tone="info" message={generationNotice} />
      ) : null}

      {!script ? (
        <Card className="p-6">
          <p className="max-w-2xl text-sm leading-6 text-bloom-ink/62">
            Gera um roteiro inicial com hook, timeline, legenda, hashtags e
            sugestão de áudio. Se a API externa não estiver configurada,
            disponível ou com quota, o BloomStudio usa fallback local para
            manter o fluxo criativo.
          </p>
        </Card>
      ) : (
        <SceneEditor
          key={`${script.id}-${scriptVersion}-${assets
            .map((asset) => asset.id)
            .join("|")}`}
          ref={sceneEditorRef}
          projectId={projectId}
          projectDuration={projectDuration}
          assets={assets}
          script={script}
          onDirtyChange={setHasUnsavedChanges}
          onScriptSaved={handleScriptSaved}
        />
      )}

      {script ? (
        <VideoExportPanel
          exportItem={latestExport}
          hasUnsavedChanges={hasUnsavedChanges}
          isExportStale={isExportStale}
          isRendering={isRendering}
          renderError={renderError}
          renderSuccess={renderSuccess}
          status={status}
        />
      ) : null}
    </section>
  );
}

function VideoExportPanel({
  exportItem,
  hasUnsavedChanges,
  isExportStale,
  isRendering,
  renderError,
  renderSuccess,
  status,
}: {
  exportItem: StoredReelExport | null;
  hasUnsavedChanges: boolean;
  isExportStale: boolean;
  isRendering: boolean;
  renderError: string;
  renderSuccess: string;
  status: string;
}) {
  const exportVersion = exportItem
    ? encodeURIComponent(exportItem.createdAt)
    : "";
  const exportUrl = exportItem
    ? `/api/exports/${exportItem.id}?v=${exportVersion}`
    : "";

  return (
    <Card className="space-y-5 p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <Badge variant="cream">Export</Badge>
          <h3 className="mt-3 font-serif text-4xl text-bloom-ink">
            Vídeo final
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-bloom-ink/58">
            O MP4 é criado localmente a partir da timeline guardada e fica fora
            do Git.
          </p>
        </div>
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      </div>

      {isRendering || status === "rendering" ? (
        <StatusMessage
          tone="info"
          message="A gerar o vídeo localmente. Este passo pode demorar alguns minutos."
        />
      ) : null}
      {renderSuccess ? (
        <StatusMessage tone="success" message={renderSuccess} />
      ) : null}
      {renderError ? (
        <StatusMessage tone="error" message={renderError} />
      ) : null}
      {hasUnsavedChanges ? (
        <StatusMessage
          tone="info"
          message="Tens alterações por guardar. Ao gerar o vídeo, a timeline é guardada automaticamente primeiro."
        />
      ) : null}
      {isExportStale ? (
        <StatusMessage
          tone="info"
          message="Este vídeo pode estar desatualizado. Gera novamente para aplicar as alterações."
        />
      ) : null}
      {status === "failed" && !renderError ? (
        <StatusMessage
          tone="error"
          message="A última renderização falhou. Confirma os assets e tenta novamente."
        />
      ) : null}

      {exportItem ? (
        <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
          <div className="overflow-hidden rounded-lg border border-bloom-olive/16 bg-bloom-ink">
            <video
              src={exportUrl}
              className="aspect-[9/16] h-full w-full bg-bloom-ink object-contain"
              controls
              preload="metadata"
            />
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <ExportMetric label="Resolução" value={exportItem.resolution} />
              <ExportMetric
                label="Duração"
                value={
                  exportItem.duration ? `${exportItem.duration}s` : "Sem dados"
                }
              />
              <ExportMetric
                label="Criado em"
                value={formatExportDate(exportItem.createdAt)}
              />
            </div>
            <a
              href={exportUrl}
              download="bloomstudio-reel.mp4"
              className={buttonStyles({ variant: "primary" })}
            >
              <Download aria-hidden className="h-4 w-4" />
              Download MP4
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-bloom-olive/14 bg-bloom-cream/55 p-5 text-sm leading-6 text-bloom-ink/62">
          Ainda não há vídeo exportado para este projeto.
        </div>
      )}
    </Card>
  );
}

function ExportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-bloom-olive/14 bg-bloom-cream/55 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-bloom-ink">{value}</p>
    </div>
  );
}

function StatusMessage({
  message,
  tone,
}: {
  tone: "success" | "error" | "info";
  message: string;
}) {
  const styles = {
    success: "border-bloom-olive/25 bg-bloom-sage/35 text-bloom-ink",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-bloom-clay/30 bg-bloom-cream text-bloom-ink",
  };
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${styles[tone]}`}
    >
      <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function formatExportDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
