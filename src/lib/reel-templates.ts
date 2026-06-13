export type ReelTemplate = {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  suggestedDuration: number;
  defaultMotion:
    | "slow_zoom_in"
    | "slow_zoom_out"
    | "pan_up"
    | "pan_down"
    | "static";
  textPosition: "center_bottom" | "center" | "lower_third";
  suggestedCTA: string;
  moodKeywords: string[];
  sceneStructure: string[];
};

export const REEL_TEMPLATES: ReelTemplate[] = [
  {
    id: "soft-art-reveal",
    name: "Soft Art Reveal",
    description:
      "Para mostrar pintura final, print digital ou mockup Etsy. Começa em detalhe e termina na peça completa.",
    bestFor: "Pintura final, prints digitais, mockups e detalhes botânicos.",
    suggestedDuration: 15,
    defaultMotion: "slow_zoom_in",
    textPosition: "center_bottom",
    suggestedCTA: "Guarda este detalhe para rever com calma.",
    moodKeywords: ["quiet", "delicate", "refined", "botanical"],
    sceneStructure: [
      "Detalhe macro ou textura da obra",
      "Movimento lento sobre cor, papel ou pincelada",
      "Revelação da peça completa",
      "CTA suave ou contexto decorativo",
    ],
  },
  {
    id: "sketchbook-diary",
    name: "Sketchbook Diary",
    description:
      "Para sketches, passeios, jardim, cafés, momentos no sofá e pequenas memórias visuais.",
    bestFor: "Sketchbook, passeios, estudos pequenos e bastidores íntimos.",
    suggestedDuration: 20,
    defaultMotion: "pan_down",
    textPosition: "lower_third",
    suggestedCTA: "Um momento pequeno para guardar.",
    moodKeywords: ["personal", "slow", "nostalgic", "warm"],
    sceneStructure: [
      "Momento de entrada ou ambiente",
      "Página do sketchbook ou detalhe do traço",
      "Mão, material ou contexto natural",
      "Fecho com sensação de memória visual",
    ],
  },
  {
    id: "from-blank-to-bloom",
    name: "From Blank to Bloom",
    description:
      "Para processo artístico: começa no papel branco ou primeiros traços e termina na peça final.",
    bestFor: "Processo, antes e depois, pintura em progresso e transformação.",
    suggestedDuration: 20,
    defaultMotion: "slow_zoom_out",
    textPosition: "center_bottom",
    suggestedCTA: "Vem ver o processo completo.",
    moodKeywords: ["transformation", "gentle progress", "handmade"],
    sceneStructure: [
      "Papel branco, primeiro traço ou camada inicial",
      "Detalhe do processo em progresso",
      "Textura, cor ou composição a ganhar forma",
      "Obra final com contexto calmo",
    ],
  },
  {
    id: "etsy-print-promo",
    name: "Etsy Print Promo",
    description:
      "Para promover prints digitais sem parecer demasiado comercial: detalhe, mockup, benefício decorativo e CTA suave.",
    bestFor: "Prints digitais, decoração calma, mockups e lançamentos Etsy.",
    suggestedDuration: 15,
    defaultMotion: "static",
    textPosition: "lower_third",
    suggestedCTA: "Disponivel na loja, se quiseres trazer natureza para casa.",
    moodKeywords: ["soft commerce", "home decor", "calm interiors"],
    sceneStructure: [
      "Detalhe bonito do print",
      "Mockup ou contexto numa parede calma",
      "Benefício decorativo em linguagem simples",
      "CTA discreto para a loja",
    ],
  },
];

export const TEMPLATE_OPTIONS = REEL_TEMPLATES.map(
  (template) => template.name,
) as [string, ...string[]];

export function getTemplateByName(name: string | null | undefined) {
  return (
    REEL_TEMPLATES.find((template) => template.name === name) ??
    REEL_TEMPLATES[0]
  );
}
