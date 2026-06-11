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
};

async function main() {
  const existingProfile = await prisma.brandProfile.findFirst({
    where: { name: brandProfile.name },
    select: { id: true },
  });

  if (existingProfile) {
    await prisma.brandProfile.update({
      where: { id: existingProfile.id },
      data: brandProfile,
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
