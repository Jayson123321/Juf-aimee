CREATE EXTENSION IF NOT EXISTS vector;
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_subjectId_fkey";

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "bloomNiveau" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "uitleg" TEXT,
ALTER COLUMN "subjectId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "bloomNiveau" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "groep" TEXT;

-- CreateTable
CREATE TABLE "OppChunk" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "tekst" TEXT NOT NULL,
    "embedding" vector(1024),

    CONSTRAINT "OppChunk_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OppChunk" ADD CONSTRAINT "OppChunk_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
