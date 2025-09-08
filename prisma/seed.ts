import bcrypt from "bcrypt";
import { PrismaClient, Role } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordIbrahim = await bcrypt.hash("ibrahim123", 10);
  const passwordAliou = await bcrypt.hash("aliou123", 10);

  // Upsert users
  const admin = await prisma.user.upsert({
    where: { username: "thierno" },
    update: {},
    create: {
      username: "thierno",
      name: "Thierno Sadou Bah",
      phone: "+224622538285",
      passwordHash: passwordAdmin,
      role: Role.ADMIN,
    },
  });

  const ibrahim = await prisma.user.upsert({
    where: { username: "ibrahim" },
    update: {},
    create: {
      username: "ibrahim",
      name: "Ibrahim",
      phone: "+224624774110",
      passwordHash: passwordIbrahim,
      role: Role.WORKER,
    },
  });

  const aliou = await prisma.user.upsert({
    where: { username: "aliou" },
    update: {},
    create: {
      username: "aliou",
      name: "Aliou Bah",
      phone: "+224625145065",
      passwordHash: passwordAliou,
      role: Role.WORKER,
    },
  });

  // Products
  await prisma.product.upsert({
    where: { sku: "MATTRESS_23_180x190" },
    update: {},
    create: {
      name: "Matelas épaisseur 23 (180x190 cm)",
      sku: "MATTRESS_23_180x190",
      defaultWholesalePrice: 1_700_000,
    },
  });

  await prisma.product.upsert({
    where: { sku: "MATTRESS_25_180x190" },
    update: {},
    create: {
      name: "Matelas épaisseur 25 (180x190 cm)",
      sku: "MATTRESS_25_180x190",
      defaultWholesalePrice: 1_800_000,
    },
  });

  await prisma.product.upsert({
    where: { sku: "PILLOW_STANDARD" },
    update: {},
    create: {
      name: "Oreiller",
      sku: "PILLOW_STANDARD",
      defaultWholesalePrice: 140_000,
    },
  });

  console.log("Seed complete:", { admin: admin.username, ibrahim: ibrahim.username, aliou: aliou.username });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


