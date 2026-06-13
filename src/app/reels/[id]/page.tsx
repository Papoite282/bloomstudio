import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Film, ImageIcon } from "lucide-react";
import type { MediaAsset, ReelExport, ReelScript } from "@prisma/client";

import {
  ScriptGenerationPanel,
  type StoredMediaAsset,
  type StoredReelExport,
  type StoredReelScript,
} from "@/components/reels/script-generation-panel";
import { ProjectAssetUpload } from "@/components/reels/project-asset-upload";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getTemplateByName } from "@/lib/reel-templates";
import { reelSceneSchema } from "@/lib/schemas/reelScriptSchema";
import { getStatusLabel, getStatusVariant } from "@/lib/status-labels";

type ReelDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ReelDetailsPageProps) {
  const { id } = await params;
  const project = await prisma.reelProject.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: project ? project.title : "Reel",
  };
}

export default async function ReelDetailsPage({
  params,
}: ReelDetailsPageProps) {
  const { id } = await params;
  const project = await prisma.reelProject.findUnique({
    where: { id },
    include: {
      mediaAssets: {
        orderBy: { order: "asc" },
      },
      script: true,
      exports: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const selectedTemplate = project.template
    ? getTemplateByName(project.template)
    : null;

  return (
    <div className="space-y-8">
      <section className="border-b border-bloom-olive/15 pb-6">
        <Link
          href="/reels"
          className="inline-flex items-center gap-2 text-sm font-medium text-bloom-ink/58 transition hover:text-bloom-ink"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Voltar aos reels
        </Link>

        <div className="mt-5 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getStatusVariant(project.status)}>
              {getStatusLabel(project.status)}
            </Badge>
            <span className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
              {formatDate(project.createdAt)}
            </span>
          </div>
          <h1 className="font-serif text-5xl leading-tight text-bloom-ink">
            {project.title}
          </h1>
          <p className="text-base leading-7 text-bloom-ink/62">
            {project.objective}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Estilo" value={project.style} />
        <Metric
          label="Template"
          value={selectedTemplate?.name ?? "Sem template"}
        />
        <Metric label="Duração" value={`${project.duration}s`} />
        <Metric label="Idioma" value={project.language.toUpperCase()} />
      </section>

      {selectedTemplate ? (
        <Card className="p-5">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="max-w-3xl">
              <Badge variant="cream">Template criativo</Badge>
              <h2 className="mt-3 font-serif text-3xl text-bloom-ink">
                {selectedTemplate.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-bloom-ink/62">
                {selectedTemplate.description}
              </p>
              <p className="mt-3 text-sm text-bloom-ink/58">
                Ideal para {selectedTemplate.bestFor.toLowerCase()}
              </p>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:min-w-80 lg:grid-cols-1">
              <TemplateFact
                label="Movimento base"
                value={formatMotion(selectedTemplate.defaultMotion)}
              />
              <TemplateFact
                label="CTA sugerido"
                value={selectedTemplate.suggestedCTA}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {selectedTemplate.moodKeywords.map((keyword) => (
              <Badge key={keyword} variant="olive">
                {keyword}
              </Badge>
            ))}
          </div>
        </Card>
      ) : null}

      <ProjectAssetUpload
        projectId={project.id}
        existingAssetCount={project.mediaAssets.length}
      />

      <ScriptGenerationPanel
        projectId={project.id}
        projectDuration={project.duration}
        projectStatus={project.status}
        assets={serializeAssets(project.mediaAssets)}
        initialExports={serializeExports(project.exports)}
        initialScript={serializeScript(project.script)}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Badge variant="cream">Assets</Badge>
              <h2 className="mt-3 font-serif text-4xl text-bloom-ink">
                Ficheiros carregados
              </h2>
            </div>
            <span className="text-sm text-bloom-ink/50">
              {project.mediaAssets.length} ficheiros
            </span>
          </div>

          {project.mediaAssets.length === 0 ? (
            <Card className="p-6 text-sm text-bloom-ink/62">
              Este projeto ainda não tem ficheiros associados.
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {project.mediaAssets.map((asset) => (
                <Card key={asset.id} className="overflow-hidden">
                  <div className="aspect-[4/3] bg-bloom-cream">
                    {asset.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/media/${asset.id}`}
                        alt={asset.originalName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        src={`/api/media/${asset.id}`}
                        className="h-full w-full object-cover"
                        controls
                      />
                    )}
                  </div>
                  <div className="flex items-start gap-3 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bloom-sage/45 text-bloom-ink">
                      {asset.type === "image" ? (
                        <ImageIcon aria-hidden className="h-4 w-4" />
                      ) : (
                        <Film aria-hidden className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-bloom-ink">
                        {asset.originalName}
                      </p>
                      <p className="mt-1 text-xs text-bloom-ink/50">
                        Ordem {asset.order + 1}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <CalendarDays aria-hidden className="h-4 w-4 text-bloom-olive" />
              <h2 className="font-serif text-3xl text-bloom-ink">
                Estado do projeto
              </h2>
            </div>
            <div className="space-y-3 text-sm text-bloom-ink/62">
              <p>
                Criado em <strong>{formatDate(project.createdAt)}</strong>.
              </p>
              <p>
                Última atualização em{" "}
                <strong>{formatDate(project.updatedAt)}</strong>.
              </p>
              <p>
                {project.script
                  ? "Este projeto já tem roteiro guardado."
                  : "O roteiro ainda não foi gerado."}
              </p>
              <p>
                {project.exports.length === 0
                  ? "Ainda não há exportações associadas."
                  : `${project.exports.length} exportações guardadas.`}
              </p>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-bloom-ink">{value}</p>
    </Card>
  );
}

function TemplateFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-bloom-olive/14 bg-bloom-cream/55 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
        {label}
      </p>
      <p className="mt-1 text-sm leading-5 text-bloom-ink">{value}</p>
    </div>
  );
}

function formatMotion(motion: string) {
  const labels: Record<string, string> = {
    pan_down: "Pan down",
    pan_up: "Pan up",
    slow_zoom_in: "Slow zoom in",
    slow_zoom_out: "Slow zoom out",
    static: "Static",
  };

  return labels[motion] ?? motion;
}

function serializeAssets(assets: MediaAsset[]): StoredMediaAsset[] {
  return assets.map((asset) => ({
    id: asset.id,
    type: asset.type,
    originalName: asset.originalName,
    order: asset.order,
  }));
}

function serializeExports(exports: ReelExport[]): StoredReelExport[] {
  return exports.map((reelExport) => ({
    id: reelExport.id,
    duration: reelExport.duration,
    resolution: reelExport.resolution,
    createdAt: reelExport.createdAt.toISOString(),
  }));
}

function serializeScript(script: ReelScript | null): StoredReelScript | null {
  if (!script) {
    return null;
  }

  return {
    id: script.id,
    title: script.title ?? "Roteiro sugerido",
    hook: script.hook,
    scenes: parseScenes(script.scenesJson),
    caption: script.caption,
    hashtags: parseHashtags(script.hashtags),
    audioSuggestion: script.audioSuggestion,
    generationSource: script.generationSource === "ai" ? "ai" : "local",
  };
}

function parseScenes(value: string) {
  const parsed = safeJsonParse(value);
  const scenes = reelSceneSchema.array().safeParse(parsed);

  return scenes.success ? scenes.data : [];
}

function parseHashtags(value: string) {
  const parsed = safeJsonParse(value);

  return Array.isArray(parsed)
    ? parsed.filter((item): item is string => typeof item === "string")
    : [];
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
