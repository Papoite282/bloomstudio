import type { BadgeVariant } from "@/components/ui/badge";

export const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  generating_script: "A criar roteiro",
  script_ready: "Roteiro pronto",
  rendering: "A gerar vídeo",
  exported: "Vídeo exportado",
  failed: "Erro",
};

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  draft: "cream",
  generating_script: "blush",
  script_ready: "olive",
  rendering: "blush",
  exported: "dark",
  failed: "blush",
};

export function getStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

export function getStatusVariant(status: string): BadgeVariant {
  return STATUS_VARIANTS[status] ?? "cream";
}
