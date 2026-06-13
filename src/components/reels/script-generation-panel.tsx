"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, Loader2, Sparkles } from "lucide-react";

import {
  SceneEditor,
  type SceneEditorAsset,
  type SceneEditorScript,
} from "@/components/SceneEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type StoredReelScript = SceneEditorScript;
export type StoredMediaAsset = SceneEditorAsset;

export function ScriptGenerationPanel({
  projectId,
  projectDuration,
  assets,
  initialScript,
}: {
  projectId: string;
  projectDuration: number;
  assets: StoredMediaAsset[];
  initialScript: StoredReelScript | null;
}) {
  const router = useRouter();
  const [script, setScript] = useState(initialScript);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  async function generateScript() {
    setIsGenerating(true);
    setError("");

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
      } | null;

      if (!response.ok || !data?.script) {
        setError(data?.error ?? "Não foi possível gerar o roteiro.");
        setIsGenerating(false);
        return;
      }

      setScript(data.script);
      router.refresh();
    } catch {
      setError("Não foi possível gerar o roteiro. Tenta novamente.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleScriptSaved(updatedScript: StoredReelScript) {
    setScript(updatedScript);
    router.refresh();
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
            <div className="mt-3">
              <Badge
                variant={script.generationSource === "ai" ? "dark" : "olive"}
              >
                {script.generationSource === "ai"
                  ? "Gerado com IA"
                  : "Gerado localmente"}
              </Badge>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={generateScript} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles aria-hidden className="h-4 w-4" />
            )}
            Gerar roteiro com IA
          </Button>
          <Button
            disabled
            variant="secondary"
            title="Disponível numa fase futura"
          >
            <Clapperboard aria-hidden className="h-4 w-4" />
            Gerar vídeo
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!script ? (
        <Card className="p-6">
          <p className="max-w-2xl text-sm leading-6 text-bloom-ink/62">
            Gera um roteiro inicial com hook, timeline, legenda, hashtags e
            sugestão de áudio. Se não houver chave de API configurada, o
            BloomStudio usa um fallback local para manter o fluxo criativo.
          </p>
        </Card>
      ) : (
        <SceneEditor
          projectId={projectId}
          projectDuration={projectDuration}
          assets={assets}
          script={script}
          onScriptSaved={handleScriptSaved}
        />
      )}
    </section>
  );
}
