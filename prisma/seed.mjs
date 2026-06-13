import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const brandProfile = {
  name: "Bloommere",
  description:
    "Marca artística com estética botanical, cottagecore, suave, delicada, natural e minimalista. Cria arte inspirada na natureza, prints digitais, sketchbook moments e pequenos detalhes visuais para casas calmas e acolhedoras.",
  tone: "Artístico, íntimo, delicado, natural, humano e nada cringe.",
  colors:
    "creme, verde oliva suave, castanho claro, bege quente, branco natural, preto suave",
  audience:
    "Pessoas que gostam de arte botânica, decoração calma, prints digitais, slow living, natureza, sketchbooks e estética cottagecore.",
  language: "pt",
  wordsToAvoid:
    "viral garantido, hack de algoritmo, explode o teu alcance, conteúdo que vende sozinho, fórmula secreta, sucesso garantido",
};

async function main() {
  const existingProfile = await prisma.brandProfile.findFirst({
    select: {
      id: true,
      colors: true,
      audience: true,
      wordsToAvoid: true,
    },
  });

  if (existingProfile) {
    await prisma.brandProfile.update({
      where: { id: existingProfile.id },
      data: {
        colors: existingProfile.colors ?? brandProfile.colors,
        audience: existingProfile.audience ?? brandProfile.audience,
        wordsToAvoid: existingProfile.wordsToAvoid ?? brandProfile.wordsToAvoid,
      },
    });

    return;
  }

  await prisma.brandProfile.create({
    data: brandProfile,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
