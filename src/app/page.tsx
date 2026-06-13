import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  Download,
  Feather,
  FolderOpen,
  LayoutPanelLeft,
  Sparkles,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getStatusLabel, getStatusVariant } from "@/lib/status-labels";

const studioFlow = [
  {
    title: "Upload",
    description: "Reúne fotos, vídeos e detalhes da obra num projeto local.",
    icon: Upload,
  },
  {
    title: "Roteiro",
    description: "Gera hooks, cenas, legenda, hashtags e sugestão de áudio.",
    icon: Feather,
  },
  {
    title: "Edição",
    description: "Afina a timeline, movimentos e textos antes do export.",
    icon: LayoutPanelLeft,
  },
  {
    title: "Export MP4",
    description: "Cria um vídeo vertical pronto para rever e descarregar.",
    icon: Clapperboard,
  },
];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [brandProfile, totalProjects, totalExports, latestProjects] =
    await Promise.all([
      prisma.brandProfile.findFirst({ orderBy: { createdAt: "asc" } }),
      prisma.reelProject.count(),
      prisma.reelExport.count(),
      prisma.reelProject.findMany({
        orderBy: { updatedAt: "desc" },
        take: 4,
        include: {
          _count: {
            select: {
              exports: true,
              mediaAssets: true,
            },
          },
        },
      }),
    ]);
  const brandName = brandProfile?.name ?? "Bloommere";

  return (
    <div className="space-y-10">
      <section className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <div className="flex min-h-[480px] flex-col justify-between rounded-lg border border-bloom-olive/18 bg-bloom-porcelain/86 p-6 shadow-sm md:p-8">
          <div className="space-y-6">
            <Badge variant="olive">Bom dia, {brandName}</Badge>
            <div className="max-w-3xl space-y-5">
              <h1 className="font-serif text-5xl leading-[1.02] text-bloom-ink md:text-6xl">
                Um estúdio calmo para transformar arte em reels verticais.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-bloom-ink/66">
                Organiza assets, roteiro, timeline e export MP4 num fluxo local,
                pensado para conteúdo visual suave e consistente.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/reels/new"
                className={buttonStyles({ variant: "primary" })}
              >
                Criar novo reel
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link
                href="/reels"
                className={buttonStyles({ variant: "secondary" })}
              >
                <FolderOpen aria-hidden className="h-4 w-4" />
                Ver biblioteca
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric label="Projetos criados" value={String(totalProjects)} />
            <Metric label="Exports MP4" value={String(totalExports)} />
            <Metric
              label="Última atividade"
              value={
                latestProjects[0]
                  ? formatDate(latestProjects[0].updatedAt)
                  : "Sem projetos"
              }
            />
          </div>
        </div>

        <div className="relative min-h-[480px] overflow-hidden rounded-lg border border-bloom-clay/18 bg-bloom-ink shadow-sm">
          <Image
            src="/studio-desk.png"
            alt="Mesa de artista com pintura botânica e preview vertical de vídeo"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1280px) 40vw, 100vw"
          />
          <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/35 bg-bloom-cream/92 p-4 shadow-lg backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-bloom-ink text-bloom-cream">
                <Sparkles aria-hidden className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-bloom-ink/55">
                  Próximo passo
                </p>
                <h2 className="mt-1 font-serif text-2xl text-bloom-ink">
                  Rever a timeline antes do export.
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {studioFlow.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="space-y-5 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-bloom-olive text-bloom-cream">
                <Icon aria-hidden className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-2xl text-bloom-ink">
                  {item.title}
                </h2>
                <p className="text-sm leading-6 text-bloom-ink/62">
                  {item.description}
                </p>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
        <div className="space-y-4">
          <Badge variant="cream">Últimos projetos</Badge>
          <h2 className="font-serif text-4xl leading-tight text-bloom-ink">
            Biblioteca recente
          </h2>
          <p className="text-sm leading-7 text-bloom-ink/62">
            Abre um projeto para continuar o roteiro, ajustar a timeline ou
            gerar um novo MP4.
          </p>
        </div>

        {latestProjects.length === 0 ? (
          <Card className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <Download aria-hidden className="h-8 w-8 text-bloom-olive" />
            <h3 className="mt-4 font-serif text-3xl text-bloom-ink">
              Ainda não há projetos
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-bloom-ink/62">
              Cria o primeiro reel para começar a construir a biblioteca local.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {latestProjects.map((project) => (
              <Card key={project.id} className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant={getStatusVariant(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    <h3 className="mt-3 font-serif text-2xl leading-tight text-bloom-ink">
                      {project.title}
                    </h3>
                  </div>
                  <Link
                    href={`/reels/${project.id}`}
                    aria-label={`Abrir ${project.title}`}
                    title={`Abrir ${project.title}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-bloom-olive/20 text-bloom-ink transition hover:bg-bloom-sage/35"
                  >
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                </div>
                <p className="text-sm leading-6 text-bloom-ink/62">
                  {project.objective}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-bloom-ink/52">
                  <span>{project._count.mediaAssets} assets</span>
                  <span>{project._count.exports} exports</span>
                  <span>{formatDate(project.updatedAt)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-bloom-olive/15 bg-white/55 p-4">
      <p className="font-serif text-4xl text-bloom-ink">{value}</p>
      <p className="mt-2 text-sm leading-5 text-bloom-ink/60">{label}</p>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
  }).format(date);
}
