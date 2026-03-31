/*
  Warnings:

  - You are about to drop the column `diagnosisDsmV` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosisSetBy` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `didacticAgeAtPlacement` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `dyscalculia` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `dyslexia` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `medicalData` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `medication` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `placementAge` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `sourceDocumentName` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `startDateSpinaker` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `supportCurrent` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `supportPast` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `tlv` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `versionLabel` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `DevelopmentOverview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DevelopmentPerspective` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DidacticActionPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DidacticDevelopment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IndependentTestGoal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IndependentTestMeasurement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrativeImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MethodBoundTest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParentMeetingNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PedagogicalActionPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfileSignature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PsychologicalAssessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScolStudentCompetency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScolTeacherCompetency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentAttentionEducationNeed` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupportingHinderingFactor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DevelopmentOverview" DROP CONSTRAINT "DevelopmentOverview_profileId_fkey";

-- DropForeignKey
ALTER TABLE "DevelopmentPerspective" DROP CONSTRAINT "DevelopmentPerspective_profileId_fkey";

-- DropForeignKey
ALTER TABLE "DidacticActionPlan" DROP CONSTRAINT "DidacticActionPlan_profileId_fkey";

-- DropForeignKey
ALTER TABLE "DidacticDevelopment" DROP CONSTRAINT "DidacticDevelopment_profileId_fkey";

-- DropForeignKey
ALTER TABLE "IndependentTestGoal" DROP CONSTRAINT "IndependentTestGoal_profileId_fkey";

-- DropForeignKey
ALTER TABLE "IndependentTestMeasurement" DROP CONSTRAINT "IndependentTestMeasurement_profileId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrativeImage" DROP CONSTRAINT "IntegrativeImage_profileId_fkey";

-- DropForeignKey
ALTER TABLE "MethodBoundTest" DROP CONSTRAINT "MethodBoundTest_profileId_fkey";

-- DropForeignKey
ALTER TABLE "ParentMeetingNote" DROP CONSTRAINT "ParentMeetingNote_profileId_fkey";

-- DropForeignKey
ALTER TABLE "PedagogicalActionPlan" DROP CONSTRAINT "PedagogicalActionPlan_profileId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileSignature" DROP CONSTRAINT "ProfileSignature_profileId_fkey";

-- DropForeignKey
ALTER TABLE "PsychologicalAssessment" DROP CONSTRAINT "PsychologicalAssessment_profileId_fkey";

-- DropForeignKey
ALTER TABLE "ScolStudentCompetency" DROP CONSTRAINT "ScolStudentCompetency_profileId_fkey";

-- DropForeignKey
ALTER TABLE "ScolTeacherCompetency" DROP CONSTRAINT "ScolTeacherCompetency_profileId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAttentionEducationNeed" DROP CONSTRAINT "StudentAttentionEducationNeed_profileId_fkey";

-- DropForeignKey
ALTER TABLE "StudentProfile" DROP CONSTRAINT "StudentProfile_createdById_fkey";

-- DropForeignKey
ALTER TABLE "StudentProfile" DROP CONSTRAINT "StudentProfile_studentId_fkey";

-- DropForeignKey
ALTER TABLE "SupportingHinderingFactor" DROP CONSTRAINT "SupportingHinderingFactor_profileId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherStudent" DROP CONSTRAINT "TeacherStudent_studentId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherStudent" DROP CONSTRAINT "TeacherStudent_teacherId_fkey";

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "diagnosisDsmV",
DROP COLUMN "diagnosisSetBy",
DROP COLUMN "didacticAgeAtPlacement",
DROP COLUMN "dyscalculia",
DROP COLUMN "dyslexia",
DROP COLUMN "medicalData",
DROP COLUMN "medication",
DROP COLUMN "placementAge",
DROP COLUMN "sourceDocumentName",
DROP COLUMN "startDateSpinaker",
DROP COLUMN "supportCurrent",
DROP COLUMN "supportPast",
DROP COLUMN "tlv",
DROP COLUMN "versionLabel";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName",
ADD COLUMN     "name" TEXT;

-- DropTable
DROP TABLE "DevelopmentOverview";

-- DropTable
DROP TABLE "DevelopmentPerspective";

-- DropTable
DROP TABLE "DidacticActionPlan";

-- DropTable
DROP TABLE "DidacticDevelopment";

-- DropTable
DROP TABLE "IndependentTestGoal";

-- DropTable
DROP TABLE "IndependentTestMeasurement";

-- DropTable
DROP TABLE "IntegrativeImage";

-- DropTable
DROP TABLE "MethodBoundTest";

-- DropTable
DROP TABLE "ParentMeetingNote";

-- DropTable
DROP TABLE "PedagogicalActionPlan";

-- DropTable
DROP TABLE "ProfileSignature";

-- DropTable
DROP TABLE "PsychologicalAssessment";

-- DropTable
DROP TABLE "ScolStudentCompetency";

-- DropTable
DROP TABLE "ScolTeacherCompetency";

-- DropTable
DROP TABLE "StudentAttentionEducationNeed";

-- DropTable
DROP TABLE "SupportingHinderingFactor";
