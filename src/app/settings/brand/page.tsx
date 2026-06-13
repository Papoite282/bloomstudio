import { BrandProfileForm } from "@/components/settings/brand-profile-form";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_BRAND_PROFILE } from "@/lib/brand-profile";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Marca",
};

export const dynamic = "force-dynamic";

export default async function BrandSettingsPage() {
  const profile =
    (await prisma.brandProfile.findFirst({
      orderBy: { createdAt: "asc" },
    })) ??
    (await prisma.brandProfile.create({
      data: DEFAULT_BRAND_PROFILE,
    }));

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-bloom-olive/15 pb-6 xl:flex-row xl:items-end">
        <div className="max-w-3xl space-y-3">
          <Badge variant="olive">Marca</Badge>
          <h1 className="font-serif text-5xl leading-tight text-bloom-ink">
            Direção criativa da Bloommere
          </h1>
          <p className="text-base leading-7 text-bloom-ink/62">
            Mantém a voz, audiência e limites de linguagem alinhados antes de
            gerar novos roteiros.
          </p>
        </div>
      </section>

      <BrandProfileForm
        initialProfile={{
          id: profile.id,
          name: profile.name,
          description: profile.description,
          tone: profile.tone,
          colors: profile.colors,
          audience: profile.audience,
          language: profile.language,
          wordsToAvoid: profile.wordsToAvoid,
        }}
      />
    </div>
  );
}
