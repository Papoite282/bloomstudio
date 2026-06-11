import type { MediaAsset, ReelProject } from "@prisma/client";

import type { ReelScriptOutput } from "@/lib/schemas/reelScriptSchema";

const motions = [
  "slow_zoom_in",
  "slow_zoom_out",
  "pan_up",
  "pan_down",
  "static",
] as const;

export function createFallbackReelScript({
  project,
  mediaAssets,
}: {
  project: ReelProject;
  mediaAssets: MediaAsset[];
}): ReelScriptOutput {
  const assetCount = Math.max(mediaAssets.length, 1);
  const sceneCount = Math.min(Math.max(assetCount, 3), 5);
  const baseDuration = Math.max(1, Math.floor(project.duration / sceneCount));
  const isEnglish = project.language === "en";
  const template = project.template ?? "Soft Art Reveal";

  return {
    title: isEnglish
      ? `${project.title} - soft reel script`
      : `${project.title} - roteiro suave`,
    hook: isEnglish
      ? englishHook(project.objective, template)
      : portugueseHook(project.objective, template),
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
        onScreenText: isEnglish
          ? englishOnScreenText(index, sceneCount, project.style)
          : portugueseOnScreenText(index, sceneCount, project.style),
        motion: motions[index % motions.length],
        notes: isEnglish
          ? englishSceneNote(index, sceneCount, project.objective)
          : portugueseSceneNote(index, sceneCount, project.objective),
      };
    }),
    caption: isEnglish
      ? `A quiet look at ${project.title.toLowerCase()} - small textures, calm details and a soft moment from the studio.`
      : `Um olhar calmo sobre ${project.title.toLowerCase()}: textura, detalhe e um bocadinho do processo no atelier.`,
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

function portugueseHook(objective: string, template: string) {
  if (objective.includes("Etsy")) {
    return "Um print calmo para trazer natureza à parede.";
  }

  if (objective.includes("Sketchbook")) {
    return "Pequenos detalhes do sketchbook, guardados devagar.";
  }

  if (template.includes("Blank")) {
    return "Do primeiro traço até ao detalhe final.";
  }

  return "Um detalhe pequeno antes da obra completa.";
}

function englishHook(objective: string, template: string) {
  if (objective.includes("Etsy")) {
    return "A quiet print for a softer wall.";
  }

  if (objective.includes("Sketchbook")) {
    return "Small sketchbook moments, gathered slowly.";
  }

  if (template.includes("Blank")) {
    return "From the first mark to the final detail.";
  }

  return "A small detail before the full artwork appears.";
}

function portugueseOnScreenText(index: number, total: number, style: string) {
  const text = [
    "começa pelo detalhe",
    `um ritmo ${style.toLowerCase()}`,
    "textura e luz natural",
    "a peça começa a respirar",
    "guarda para rever com calma",
  ];

  return index === total - 1 ? text[4] : (text[index] ?? text[1]);
}

function englishOnScreenText(index: number, total: number, style: string) {
  const text = [
    "start with the detail",
    `a ${style.toLowerCase()} rhythm`,
    "texture and natural light",
    "the piece begins to breathe",
    "save this quiet moment",
  ];

  return index === total - 1 ? text[4] : (text[index] ?? text[1]);
}

function portugueseSceneNote(index: number, total: number, objective: string) {
  if (index === 0) {
    return "Abrir com uma aproximação suave ao detalhe mais delicado.";
  }

  if (index === total - 1) {
    return `Fechar com a obra ou composição final, mantendo o objetivo: ${objective}.`;
  }

  return "Manter cortes lentos e deixar a textura conduzir a narrativa.";
}

function englishSceneNote(index: number, total: number, objective: string) {
  if (index === 0) {
    return "Open with a soft close-up of the most delicate detail.";
  }

  if (index === total - 1) {
    return `Close with the final artwork or composition, keeping the goal: ${objective}.`;
  }

  return "Keep the cuts gentle and let texture guide the story.";
}
