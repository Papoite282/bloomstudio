import type { BrandProfile } from "@prisma/client";

export const DEFAULT_WORDS_TO_AVOID = [
  "viral garantido",
  "hack de algoritmo",
  "explode o teu alcance",
  "conteúdo que vende sozinho",
  "fórmula secreta",
  "sucesso garantido",
];

export const DEFAULT_BRAND_PROFILE = {
  name: "Bloommere",
  description:
    "Marca artística com estética botanical, cottagecore, suave, delicada, natural e minimalista. Cria arte inspirada na natureza, prints digitais, sketchbook moments e pequenos detalhes visuais para casas calmas e acolhedoras.",
  tone: "Artístico, íntimo, delicado, natural, humano e nada cringe.",
  colors:
    "creme, verde oliva suave, castanho claro, bege quente, branco natural, preto suave",
  audience:
    "Pessoas que gostam de arte botânica, decoração calma, prints digitais, slow living, natureza, sketchbooks e estética cottagecore.",
  language: "pt",
  wordsToAvoid: DEFAULT_WORDS_TO_AVOID.join(", "),
};

export function getWordsToAvoid(profile: Pick<BrandProfile, "wordsToAvoid">) {
  return parseWordsToAvoid(profile.wordsToAvoid);
}

export function parseWordsToAvoid(value: string | null | undefined) {
  const words = (value ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return words.length > 0 ? words : DEFAULT_WORDS_TO_AVOID;
}
