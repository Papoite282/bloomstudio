"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, Loader2, Music2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ReelSceneOutput } from "@/lib/schemas/reelScriptSchema";

export type StoredReelScript = {
  id: string;
  title: string;
  hook: string;
  scenes: ReelSceneOutput[];
  caption: string;
  hashtags: string[];
  audioSuggestion: string | null;
  generationSource: "ai" | "local";
};

export function ScriptGenerationPanel({
  projectId,
  initialScript,
}: {
  projectId: string;
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

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge variant="cream">Roteiro</Badge>
          <h2 className="mt-3 font-serif text-4xl text-bloom-ink">
            Roteiro do reel
          </h2>
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
        <div className="space-y-4">
          <Card className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                  Título sugerido
                </p>
                <h3 className="mt-2 font-serif text-3xl text-bloom-ink">
                  {script.title}
                </h3>
              </div>
              <Badge
                variant={script.generationSource === "ai" ? "dark" : "olive"}
              >
                {script.generationSource === "ai"
                  ? "Gerado com IA"
                  : "Gerado localmente"}
              </Badge>
            </div>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <Card className="space-y-3 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                Hook
              </p>
              <p className="font-serif text-3xl leading-tight text-bloom-ink">
                {script.hook}
              </p>
            </Card>

            <Card className="space-y-4 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                Timeline
              </p>
              <div className="space-y-3">
                {script.scenes.map((scene) => (
                  <div
                    key={`${scene.order}-${scene.assetIndex}`}
                    className="rounded-lg border border-bloom-olive/14 bg-bloom-cream/55 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="cream">Cena {scene.order}</Badge>
                      <span className="text-xs text-bloom-ink/48">
                        {scene.duration}s · asset {scene.assetIndex + 1} ·{" "}
                        {formatMotion(scene.motion)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-bloom-ink">
                      {scene.onScreenText}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-bloom-ink/62">
                      {scene.notes}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="space-y-3 p-5 lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                Legenda
              </p>
              <p className="whitespace-pre-wrap text-sm leading-7 text-bloom-ink/70">
                {script.caption}
              </p>
            </Card>

            <div className="space-y-4">
              <Card className="space-y-3 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                  Hashtags
                </p>
                <div className="flex flex-wrap gap-2">
                  {script.hashtags.map((hashtag) => (
                    <Badge key={hashtag} variant="cream">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <Music2 aria-hidden className="h-4 w-4 text-bloom-olive" />
                  <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                    Áudio sugerido
                  </p>
                </div>
                <p className="text-sm leading-6 text-bloom-ink/70">
                  {script.audioSuggestion}
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function formatMotion(motion: string) {
  return motion.replaceAll("_", " ");
}
