"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type EditableBrandProfile = {
  id: string;
  name: string;
  description: string;
  tone: string;
  colors: string | null;
  audience: string | null;
  language: string;
  wordsToAvoid: string | null;
};

type BrandProfileFormProps = {
  initialProfile: EditableBrandProfile;
};

export function BrandProfileForm({ initialProfile }: BrandProfileFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function updateField<K extends keyof EditableBrandProfile>(
    field: K,
    value: EditableBrandProfile[K],
  ) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/brand", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      const data = (await response.json().catch(() => null)) as {
        brandProfile?: EditableBrandProfile;
        error?: string;
      } | null;

      if (!response.ok || !data?.brandProfile) {
        setError(data?.error ?? "Não foi possível guardar a marca.");
        return;
      }

      setProfile(data.brandProfile);
      setSuccess("Perfil de marca guardado.");
    } catch {
      setError("Não foi possível guardar a marca. Tenta novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="grid gap-6 xl:grid-cols-[1fr_0.72fr]"
      onSubmit={handleSubmit}
    >
      <Card className="space-y-5 p-5">
        <div className="flex flex-col gap-3 border-b border-bloom-olive/12 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge variant="olive">Direção criativa</Badge>
            <h2 className="mt-3 font-serif text-4xl text-bloom-ink">
              Perfil da marca
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-bloom-ink/58">
              Ajusta a voz criativa usada nos roteiros, templates e fallback
              local.
            </p>
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Save aria-hidden className="h-4 w-4" />
            )}
            Guardar marca
          </Button>
        </div>

        {success ? (
          <div className="flex items-start gap-2 rounded-lg border border-bloom-olive/25 bg-bloom-sage/35 px-4 py-3 text-sm text-bloom-ink">
            <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-[1fr_11rem]">
          <Field label="Nome" htmlFor="brand-name">
            <Input
              id="brand-name"
              value={profile.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </Field>

          <Field label="Idioma" htmlFor="brand-language">
            <Select
              id="brand-language"
              value={profile.language}
              onChange={(event) => updateField("language", event.target.value)}
            >
              <option value="pt">PT</option>
              <option value="en">EN</option>
            </Select>
          </Field>
        </div>

        <Field label="Descrição" htmlFor="brand-description">
          <Textarea
            id="brand-description"
            value={profile.description}
            onChange={(event) => updateField("description", event.target.value)}
            required
          />
        </Field>

        <Field label="Tom de voz" htmlFor="brand-tone">
          <Textarea
            id="brand-tone"
            className="min-h-24"
            value={profile.tone}
            onChange={(event) => updateField("tone", event.target.value)}
            required
          />
        </Field>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Cores" htmlFor="brand-colors">
            <Textarea
              id="brand-colors"
              className="min-h-28"
              value={profile.colors ?? ""}
              onChange={(event) => updateField("colors", event.target.value)}
            />
          </Field>

          <Field label="Público" htmlFor="brand-audience">
            <Textarea
              id="brand-audience"
              className="min-h-28"
              value={profile.audience ?? ""}
              onChange={(event) => updateField("audience", event.target.value)}
            />
          </Field>
        </div>

        <Field label="Palavras a evitar" htmlFor="brand-words-to-avoid">
          <Textarea
            id="brand-words-to-avoid"
            value={profile.wordsToAvoid ?? ""}
            onChange={(event) =>
              updateField("wordsToAvoid", event.target.value)
            }
            placeholder="viral garantido, hack de algoritmo..."
          />
        </Field>
      </Card>

      <aside className="space-y-4">
        <Card className="space-y-4 p-5">
          <Badge variant="cream">Preview</Badge>
          <div>
            <h3 className="font-serif text-4xl leading-tight text-bloom-ink">
              {profile.name || "Marca"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-bloom-ink/64">
              {profile.description}
            </p>
          </div>
          <div className="rounded-lg bg-bloom-cream/70 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
              Tom
            </p>
            <p className="mt-2 text-sm leading-6 text-bloom-ink/68">
              {profile.tone}
            </p>
          </div>
          <div className="rounded-lg bg-bloom-cream/70 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
              Linguagem evitada
            </p>
            <p className="mt-2 text-sm leading-6 text-bloom-ink/68">
              {profile.wordsToAvoid || "Defaults suaves do BloomStudio."}
            </p>
          </div>
        </Card>
      </aside>
    </form>
  );
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-bloom-ink">
        {label}
      </label>
      {children}
    </div>
  );
}
