import type { BrandProfile, MediaAsset, ReelProject } from "@prisma/client";

export function buildReelPrompt({
  brandProfile,
  project,
  mediaAssets,
}: {
  brandProfile: BrandProfile;
  project: ReelProject;
  mediaAssets: MediaAsset[];
}) {
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
Cria um roteiro para um reel vertical do BloomStudio, alinhado com a marca Bloommere.

Marca:
- Nome: ${brandProfile.name}
- Descrição: ${brandProfile.description}
- Tom: ${brandProfile.tone}
- Cores: ${brandProfile.colors ?? "creme, verde oliva suave e preto suave"}
- Público: ${brandProfile.audience ?? "pessoas que gostam de arte delicada e natureza"}
- Idioma preferido: ${brandProfile.language}

Projeto:
- Título: ${project.title}
- Objetivo: ${project.objective}
- Estilo: ${project.style}
- Template: ${project.template ?? "sem template"}
- Duração total: ${project.duration} segundos
- Idioma do roteiro: ${project.language}
- Estado atual: ${project.status}

Assets disponíveis:
${assets}

Direção criativa obrigatória:
- respeitar botanical, cottagecore, soft aesthetic, arte delicada, natureza, prints Etsy, sketchbook, slow living e autenticidade
- usar linguagem humana, íntima, natural e nada cringe
- não prometer viralidade
- evitar "viral garantido", "explodir no algoritmo", "hack secreto", linguagem agressiva de marketing, emojis em excesso e frases genéricas
- preferir textos curtos, hooks suaves, CTAs discretos e legendas prontas a editar
- distribuir as cenas pelos assets disponíveis usando assetIndex com base zero
- a soma aproximada das durações das cenas deve respeitar a duração total

Devolve apenas JSON válido com esta estrutura:
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
