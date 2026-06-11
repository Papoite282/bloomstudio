import { NewReelForm } from "@/components/reels/new-reel-form";
import { Badge } from "@/components/ui/badge";

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
            Define a obra, o material disponível e o tom visual antes de criar o
            projeto.
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

      <NewReelForm />
    </div>
  );
}
