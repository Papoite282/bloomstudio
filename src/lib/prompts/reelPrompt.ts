import type { BrandProfile, MediaAsset, ReelProject } from "@prisma/client";

import { getWordsToAvoid } from "@/lib/brand-profile";
import { getTemplateByName } from "@/lib/reel-templates";

export function buildReelPrompt({
  brandProfile,
  project,
  mediaAssets,
}: {
  brandProfile: BrandProfile;
  project: ReelProject;
  mediaAssets: MediaAsset[];
}) {
  const template = getTemplateByName(project.template);
  const wordsToAvoid = getWordsToAvoid(brandProfile).join(", ");
  const assets = mediaAssets
    .map((asset, index) => {
      return [
        `Asset ${index}`,
        `tipo: ${asset.type}`,
        `nome: ${asset.originalName}`,
        `ordem: ${asset.order}`,
      ].join(" | ");
    })
    .join("\n");

  return `
Cria um roteiro para um reel vertical do BloomStudio, alinhado com a marca ${brandProfile.name}.

Marca:
- Nome: ${brandProfile.name}
- Descrição: ${brandProfile.description}
- Tom: ${brandProfile.tone}
- Cores: ${brandProfile.colors ?? "creme, verde oliva suave e preto suave"}
- Público: ${brandProfile.audience ?? "pessoas que gostam de arte delicada e natureza"}
- Idioma preferido: ${brandProfile.language}
- Palavras e promessas a evitar: ${wordsToAvoid}

Projeto:
- Titulo: ${project.title}
- Objetivo: ${project.objective}
- Estilo: ${project.style}
- Template: ${template.name}
- Duração total: ${project.duration} segundos
- Idioma do roteiro: ${project.language}
- Estado atual: ${project.status}

Assets disponíveis:
${assets}

Template criativo:
- Descrição: ${template.description}
- Melhor para: ${template.bestFor}
- Duração sugerida: ${template.suggestedDuration}s
- Movimento base: ${template.defaultMotion}
- Posicao de texto: ${template.textPosition}
- CTA sugerido: ${template.suggestedCTA}
- Mood: ${template.moodKeywords.join(", ")}
- Estrutura de cenas: ${template.sceneStructure.join(" | ")}

Direção criativa obrigatória:
- respeitar botanical, cottagecore, soft aesthetic, arte delicada, natureza, prints Etsy, sketchbook, slow living e autenticidade
- usar linguagem humana, intima, natural e nada cringe
- não prometer viralidade
- evitar rigorosamente: ${wordsToAvoid}
- evitar linguagem agressiva de marketing, emojis em excesso e frases genericas
- preferir textos curtos, hooks suaves, CTAs discretos e legendas prontas a editar
- distribuir as cenas pelos assets disponíveis usando assetIndex com base zero
- a soma aproximada das durações das cenas deve respeitar a duração total

Devolve apenas JSON valido com esta estrutura:
{
  "title": "string",
  "hook": "string",
  "scenes": [
    {
      "order": 1,
      "duration": 3,
      "assetIndex": 0,
      "onScreenText": "string",
      "motion": "slow_zoom_in | slow_zoom_out | pan_up | pan_down | static",
      "notes": "string"
    }
  ],
  "caption": "string",
  "hashtags": ["string"],
  "audioSuggestion": "string"
}
`.trim();
}
