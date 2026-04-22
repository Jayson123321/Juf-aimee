-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('TEXT', 'MULTIPLE_CHOICE');

-- AlterTable
ALTER TABLE "Assignment"
  ADD COLUMN "assignmentType" "AssignmentType" NOT NULL DEFAULT 'TEXT',
  ADD COLUMN "interactiveContent" JSONB;
