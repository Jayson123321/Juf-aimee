import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const student = await prisma.student.findFirst({
    where: { fullName: "Julia van Loon" },
  });

  if (!student) {
    console.log("Student niet gevonden");
    return;
  }

  console.log("Student:", student.fullName, "| ID:", student.id);
  console.log();

  const chunks = await prisma.oppChunk.findMany({
    where: { studentId: student.id },
  });

  console.log(`${chunks.length} chunk(s) gevonden:\n`);

  chunks.forEach((c, i) => {
    console.log(`--- Chunk ${i + 1} ---`);
    console.log(c.tekst);
    const heeftInjectie = /SYSTEM|negeer|ignore.*instructions/i.test(c.tekst);
    console.log(heeftInjectie ? "⚠️  INJECTIE AANWEZIG" : "✅ Schoon");
    console.log();
  });

  await prisma.$disconnect();
}

main();
