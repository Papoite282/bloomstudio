import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  Feather,
  LayoutPanelLeft,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { reelProjects } from "@/lib/reel-projects";

const metrics = [
  { label: "Reels em criação", value: "06" },
  { label: "Prontos para publicar", value: "03" },
  { label: "Ideias guardadas", value: "18" },
];

const studioFlow = [
  {
    title: "Selecionar arte",
    description: "Fotos, vídeos curtos e detalhes de processo no mesmo ponto.",
    icon: LayoutPanelLeft,
  },
  {
    title: "Definir narrativa",
    description: "Hooks, ritmo, texto no ecrã e intenção do conteúdo.",
    icon: Feather,
  },
  {
    title: "Preparar publicação",
    description: "Legenda, hashtags e checklist final para Instagram.",
    icon: Clapperboard,
  },
];

export default function DashboardPage() {
  const featuredProject = reelProjects[0];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-[520px] flex-col justify-between rounded-lg border border-bloom-olive/20 bg-bloom-cream p-6 shadow-sm md:p-8">
          <div className="space-y-6">
            <Badge variant="olive">Estúdio local para reels</Badge>
            <div className="max-w-2xl space-y-5">
              <h1 className="font-serif text-5xl leading-[1.02] text-bloom-ink md:text-6xl">
                Conteúdo visual bonito para arte que merece respirar.
              </h1>
              <p className="max-w-xl text-base leading-8 text-bloom-ink/68">
                BloomStudio organiza fotos, vídeos, roteiros, hooks, legendas e
                hashtags para transformar obras e processos criativos em reels
                verticais com uma estética suave.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-bloom-olive/15 bg-white/55 p-4"
              >
                <p className="font-serif text-4xl text-bloom-ink">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm leading-5 text-bloom-ink/60">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-bloom-clay/20 bg-bloom-ink shadow-sm">
          <Image
            src="/studio-desk.png"
            alt="Mesa de artista com pintura botânica e preview vertical de vídeo"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 48vw, 100vw"
          />
          <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/35 bg-bloom-cream/90 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-bloom-ink/55">
                  Em destaque
                </p>
                <h2 className="mt-1 font-serif text-2xl text-bloom-ink">
                  {featuredProject.title}
                </h2>
              </div>
              <Badge>{featuredProject.statusLabel}</Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
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

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <Badge variant="cream">Próxima criação</Badge>
          <h2 className="font-serif text-4xl leading-tight text-bloom-ink">
            Monta um novo reel a partir da obra, do processo ou da coleção.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/reels/new"
              className={buttonStyles({ variant: "primary" })}
            >
              Novo reel
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/reels"
              className={buttonStyles({ variant: "secondary" })}
            >
              Ver projetos
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {reelProjects.slice(0, 4).map((project) => (
            <Card key={project.id} className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-bloom-ink/45">
                    {project.source}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl leading-tight text-bloom-ink">
                    {project.title}
                  </h3>
                </div>
                <Badge variant={project.badgeVariant}>
                  {project.statusLabel}
                </Badge>
              </div>
              <p className="text-sm leading-6 text-bloom-ink/62">
                {project.hook}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
