-- AlterTable
ALTER TABLE "Assignment" ALTER COLUMN "bloomNiveau" DROP NOT NULL,
ALTER COLUMN "bloomNiveau" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "bloomNiveau" DROP NOT NULL,
ALTER COLUMN "bloomNiveau" DROP DEFAULT;
