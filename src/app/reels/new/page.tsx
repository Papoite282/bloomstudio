import { ArrowRight, Film, ImageIcon, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Novo reel",
};

const steps = ["Origem", "Direção", "Publicação"];

export default function NewReelPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-bloom-olive/15 pb-6 xl:flex-row xl:items-end">
        <div className="max-w-2xl space-y-3">
          <Badge variant="olive">Wizard</Badge>
          <h1 className="font-serif text-5xl leading-tight text-bloom-ink">
            Criar novo reel
          </h1>
          <p className="text-base leading-7 text-bloom-ink/62">
            Define a obra, o material disponível e o tom visual antes de gerar o
            plano de conteúdo.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step}
              className="rounded-lg border border-bloom-olive/16 bg-bloom-porcelain/78 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                Passo {index + 1}
              </p>
              <p className="mt-1 font-medium text-bloom-ink">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <form className="space-y-4">
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
                  Material base e identidade da obra.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-bloom-ink">
                  Título do projeto
                </span>
                <Input placeholder="Ex. Coleção primavera calma" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-bloom-ink">
                  Tipo de material
                </span>
                <Select defaultValue="mixed">
                  <option value="mixed">Fotos e vídeos</option>
                  <option value="photo">Apenas fotos</option>
                  <option value="video">Apenas vídeo</option>
                </Select>
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-bloom-ink">
                Notas sobre a obra
              </span>
              <Textarea placeholder="Cores, textura, inspiração, processo, materiais usados..." />
            </label>
          </Card>

          <Card className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-bloom-blush/30 text-bloom-ink">
                <Film aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-serif text-3xl text-bloom-ink">
                  Direção criativa
                </h2>
                <p className="text-sm text-bloom-ink/55">
                  Ritmo, sensação e estrutura do reel.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-bloom-ink">Mood</span>
                <Select defaultValue="soft">
                  <option value="soft">Suave</option>
                  <option value="editorial">Editorial</option>
                  <option value="process">Processo</option>
                  <option value="launch">Lançamento</option>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-bloom-ink">
                  Duração
                </span>
                <Select defaultValue="18">
                  <option value="12">12 segundos</option>
                  <option value="18">18 segundos</option>
                  <option value="24">24 segundos</option>
                  <option value="30">30 segundos</option>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-bloom-ink">
                  Formato
                </span>
                <Select defaultValue="9:16">
                  <option value="9:16">Vertical 9:16</option>
                  <option value="4:5">Feed 4:5</option>
                  <option value="1:1">Quadrado 1:1</option>
                </Select>
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-bloom-ink">
                Objetivo do conteúdo
              </span>
              <Textarea placeholder="Ex. mostrar bastidores, anunciar uma peça, criar desejo pela coleção..." />
            </label>
          </Card>

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary">Guardar rascunho</Button>
            <Button>
              Criar plano
              <ArrowRight aria-hidden className="h-4 w-4" />
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
                    Hook
                  </p>
                  <p className="mt-2 text-sm leading-6 text-bloom-ink/70">
                    “Um detalhe pequeno antes da obra completa.”
                  </p>
                </div>
                <div className="rounded-lg bg-bloom-cream/70 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
                    Sequência
                  </p>
                  <p className="mt-2 text-sm leading-6 text-bloom-ink/70">
                    Macro, processo, peça final, convite para guardar.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
