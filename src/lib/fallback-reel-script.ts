import type { BrandProfile, MediaAsset, ReelProject } from "@prisma/client";

import { getWordsToAvoid } from "@/lib/brand-profile";
import { getTemplateByName } from "@/lib/reel-templates";
import type { ReelScriptOutput } from "@/lib/schemas/reelScriptSchema";

const motions = [
  "slow_zoom_in",
  "slow_zoom_out",
  "pan_up",
  "pan_down",
  "static",
] as const;

export function createFallbackReelScript({
  brandProfile,
  project,
  mediaAssets,
}: {
  brandProfile: BrandProfile;
  project: ReelProject;
  mediaAssets: MediaAsset[];
}): ReelScriptOutput {
  const template = getTemplateByName(project.template);
  const assetCount = Math.max(mediaAssets.length, 1);
  const sceneCount = Math.min(
    Math.max(assetCount, template.sceneStructure.length, 3),
    5,
  );
  const baseDuration = Math.max(1, Math.floor(project.duration / sceneCount));
  const isEnglish = project.language === "en" || brandProfile.language === "en";
  const wordsToAvoid = getWordsToAvoid(brandProfile);
  const brandName = brandProfile.name || "Bloommere";

  return {
    title: isEnglish
      ? `${project.title} - ${template.name.toLowerCase()}`
      : `${project.title} - ${template.name}`,
    hook: sanitizeCopy(
      isEnglish
        ? englishHook(project.objective, template.name, brandName)
        : portugueseHook(project.objective, template.name, brandName),
      wordsToAvoid,
    ),
    scenes: Array.from({ length: sceneCount }, (_, index) => {
      const isLastScene = index === sceneCount - 1;
      const duration = isLastScene
        ? Math.max(1, project.duration - baseDuration * (sceneCount - 1))
        : baseDuration;
      const assetIndex = Math.min(index, assetCount - 1);

      return {
        order: index + 1,
        duration,
        assetIndex,
        onScreenText: sanitizeCopy(
          isEnglish
            ? englishOnScreenText(index, sceneCount, project.style, template)
            : portugueseOnScreenText(
                index,
                sceneCount,
                project.style,
                template,
              ),
          wordsToAvoid,
        ),
        motion:
          index === 0
            ? template.defaultMotion
            : motions[index % motions.length],
        notes: isEnglish
          ? englishSceneNote(index, sceneCount, project.objective, template)
          : portugueseSceneNote(index, sceneCount, project.objective, template),
      };
    }),
    caption: sanitizeCopy(
      isEnglish
        ? `A quiet look at ${project.title.toLowerCase()} - ${template.suggestedCTA.toLowerCase()}`
        : `Um olhar calmo sobre ${project.title.toLowerCase()}. ${template.suggestedCTA}`,
      wordsToAvoid,
    ),
    hashtags: isEnglish
      ? [
          "#botanicalart",
          "#slowliving",
          "#artstudio",
          "#cottagecoreart",
          "#printartist",
        ]
      : [
          "#artebotanica",
          "#slowliving",
          "#atelierdaarte",
          "#cottagecore",
          "#printsdecorativos",
        ],
    audioSuggestion: isEnglish
      ? "Soft instrumental with natural texture, piano or acoustic guitar."
      : "Instrumental suave com textura natural, piano leve ou guitarra acústica.",
  };
}

function portugueseHook(
  objective: string,
  template: string,
  brandName: string,
) {
  if (objective.includes("Etsy") || template.includes("Etsy")) {
    return `Um print ${brandName} para trazer natureza a uma parede calma.`;
  }

  if (objective.includes("Sketchbook") || template.includes("Sketchbook")) {
    return "Pequenos detalhes do sketchbook, guardados devagar.";
  }

  if (template.includes("Blank")) {
    return "Do primeiro traço até ao detalhe final.";
  }

  return "Um detalhe pequeno antes da obra completa.";
}

function englishHook(objective: string, template: string, brandName: string) {
  if (objective.includes("Etsy") || template.includes("Etsy")) {
    return `A quiet ${brandName} print for a softer wall.`;
  }

  if (objective.includes("Sketchbook") || template.includes("Sketchbook")) {
    return "Small sketchbook moments, gathered slowly.";
  }

  if (template.includes("Blank")) {
    return "From the first mark to the final detail.";
  }

  return "A small detail before the full artwork appears.";
}

function portugueseOnScreenText(
  index: number,
  total: number,
  style: string,
  template: ReturnType<typeof getTemplateByName>,
) {
  const structure = template.sceneStructure[index];
  const text = [
    "começa pelo detalhe",
    `um ritmo ${style.toLowerCase()}`,
    "textura e luz natural",
    "a peça começa a respirar",
    template.suggestedCTA,
  ];

  if (structure) {
    return structure.toLowerCase();
  }

  return index === total - 1 ? text[4] : (text[index] ?? text[1]);
}

function englishOnScreenText(
  index: number,
  total: number,
  style: string,
  template: ReturnType<typeof getTemplateByName>,
) {
  const structure = template.sceneStructure[index];
  const text = [
    "start with the detail",
    `a ${style.toLowerCase()} rhythm`,
    "texture and natural light",
    "the piece begins to breathe",
    template.suggestedCTA,
  ];

  if (structure) {
    return structure.toLowerCase();
  }

  return index === total - 1 ? text[4] : (text[index] ?? text[1]);
}

function portugueseSceneNote(
  index: number,
  total: number,
  objective: string,
  template: ReturnType<typeof getTemplateByName>,
) {
  if (index === 0) {
    return `Abrir com ${template.sceneStructure[0]?.toLowerCase() ?? "um detalhe delicado"}.`;
  }

  if (index === total - 1) {
    return `Fechar com a obra ou composição final, mantendo o objetivo: ${objective}.`;
  }

  return "Manter cortes lentos e deixar a textura conduzir a narrativa.";
}

function englishSceneNote(
  index: number,
  total: number,
  objective: string,
  template: ReturnType<typeof getTemplateByName>,
) {
  if (index === 0) {
    return `Open with ${template.sceneStructure[0]?.toLowerCase() ?? "a delicate detail"}.`;
  }

  if (index === total - 1) {
    return `Close with the final artwork or composition, keeping the goal: ${objective}.`;
  }

  return "Keep the cuts gentle and let texture guide the story.";
}

function sanitizeCopy(value: string, wordsToAvoid: string[]) {
  return wordsToAvoid.reduce((copy, word) => {
    return copy.replace(new RegExp(escapeRegExp(word), "gi"), "").trim();
  }, value);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
