-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "Leerling" (
    "id" SERIAL NOT NULL,
    "naam" TEXT NOT NULL,
    "groep" INTEGER NOT NULL,
    "bloomNiveau" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leerling_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "OppChunk" (
    "id" SERIAL NOT NULL,
    "leerlingId" INTEGER NOT NULL,
    "tekst" TEXT NOT NULL,
    "embedding" vector(1024) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OppChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opdracht" (
    "id" SERIAL NOT NULL,
    "leerlingId" INTEGER NOT NULL,
    "tekst" TEXT NOT NULL,
    "bloomNiveau" INTEGER NOT NULL,
    "bloomNaam" TEXT NOT NULL,
    "uitleg" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Opdracht_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OppChunk" ADD CONSTRAINT "OppChunk_leerlingId_fkey" FOREIGN KEY ("leerlingId") REFERENCES "Leerling"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opdracht" ADD CONSTRAINT "Opdracht_leerlingId_fkey" FOREIGN KEY ("leerlingId") REFERENCES "Leerling"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
