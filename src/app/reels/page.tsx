import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clapperboard,
  Layers3,
  Plus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getStatusLabel, getStatusVariant } from "@/lib/status-labels";

export const metadata = {
  title: "Reels",
};

export const dynamic = "force-dynamic";

export default async function ReelsPage() {
  const projects = await prisma.reelProject.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { mediaAssets: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-bloom-olive/15 pb-6 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-3">
          <Badge variant="olive">Projetos</Badge>
          <h1 className="font-serif text-5xl leading-tight text-bloom-ink">
            Reels em preparação
          </h1>
          <p className="text-base leading-7 text-bloom-ink/62">
            Uma visão limpa dos conteúdos em rascunho, planeados e prontos para
            publicar.
          </p>
        </div>

        <Link
          href="/reels/new"
          className={buttonStyles({ variant: "primary" })}
        >
          <Plus aria-hidden className="h-4 w-4" />
          Novo reel
        </Link>
      </section>

      <section className="rounded-lg border border-bloom-olive/15 bg-bloom-porcelain/72 px-4 py-3 text-sm text-bloom-ink/58">
        {projects.length === 1
          ? "1 projeto guardado"
          : `${projects.length} projetos guardados`}
      </section>

      {projects.length === 0 ? (
        <Card className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-bloom-sage text-bloom-ink">
            <Clapperboard aria-hidden className="h-6 w-6" />
          </div>
          <h2 className="mt-5 font-serif text-4xl text-bloom-ink">
            Ainda não há reels criados
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-bloom-ink/62">
            Começa por criar um projeto com fotos ou vídeos da arte. Depois
            podes organizar os assets, preparar roteiro e exportar o reel.
          </p>
          <Link
            href="/reels/new"
            className={buttonStyles({ className: "mt-6", variant: "primary" })}
          >
            Criar primeiro reel
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </Card>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getStatusVariant(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    <span className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                      {formatDate(project.createdAt)}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-serif text-3xl leading-tight text-bloom-ink">
                      {project.title}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-bloom-ink/62">
                      {project.objective}
                    </p>
                  </div>
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

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-lg bg-bloom-cream/70 px-3 py-2 text-sm text-bloom-ink/62">
                  <Layers3 aria-hidden className="h-4 w-4 text-bloom-olive" />
                  {project.style}
                </div>
                <div className="rounded-lg bg-bloom-cream/70 px-3 py-2 text-sm text-bloom-ink/62">
                  {project.template ?? "Sem template"}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-bloom-cream/70 px-3 py-2 text-sm text-bloom-ink/62">
                  <CalendarDays
                    aria-hidden
                    className="h-4 w-4 text-bloom-olive"
                  />
                  {project._count.mediaAssets} assets
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
