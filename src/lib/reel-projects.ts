import type { BadgeVariant } from "@/components/ui/badge";

export type ReelProject = {
  id: string;
  title: string;
  source: string;
  mood: string;
  duration: string;
  statusLabel: string;
  badgeVariant: BadgeVariant;
  hook: string;
  caption: string;
  updatedAt: string;
};

export const reelProjects: ReelProject[] = [
  {
    id: "botanical-study",
    title: "Estudo botânico em acrílico",
    source: "Foto + vídeo",
    mood: "Suave",
    duration: "18s",
    statusLabel: "Em roteiro",
    badgeVariant: "olive",
    hook: "Começa com o detalhe da pincelada e revela a peça final no terceiro corte.",
    caption: "Uma peça calma para guardar a memória das folhas e da luz.",
    updatedAt: "Hoje",
  },
  {
    id: "studio-morning",
    title: "Manhã no atelier",
    source: "Vídeo",
    mood: "Processo",
    duration: "24s",
    statusLabel: "Planeado",
    badgeVariant: "cream",
    hook: "Um reel de bastidores com cortes lentos, textura de papel e paleta visível.",
    caption: "Pequenos rituais antes da primeira camada de cor.",
    updatedAt: "Ontem",
  },
  {
    id: "mini-collection",
    title: "Mini coleção oliva",
    source: "Fotos",
    mood: "Editorial",
    duration: "15s",
    statusLabel: "Pronto",
    badgeVariant: "dark",
    hook: "Sequência com capas limpas, nomes das obras e chamada final para coleção.",
    caption: "Três estudos pequenos, feitos para trazer quietude à parede.",
    updatedAt: "8 Jun",
  },
  {
    id: "brush-details",
    title: "Detalhes de pincel seco",
    source: "Macro",
    mood: "Textura",
    duration: "12s",
    statusLabel: "Ideia",
    badgeVariant: "blush",
    hook: "Foca a textura em macro antes de abrir para a composição completa.",
    caption: "A textura também conta uma história.",
    updatedAt: "5 Jun",
  },
];
