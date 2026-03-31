/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TEACHER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "name",
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole",
ADD COLUMN     "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "addressLine" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "familyDetails" TEXT,
    "custodyDetails" TEXT,
    "primaryTeacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherStudent" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdById" TEXT,
    "registrationNumber" TEXT,
    "currentDate" TIMESTAMP(3),
    "currentSchoolYearGroup" TEXT,
    "currentTeacher" TEXT,
    "schoolOfOrigin" TEXT,
    "schoolHistory" TEXT,
    "startDateSpinaker" TIMESTAMP(3),
    "tlv" TEXT,
    "placementAge" TEXT,
    "didacticAgeAtPlacement" TEXT,
    "diagnosisDsmV" TEXT,
    "diagnosisSetBy" TEXT,
    "dyslexia" BOOLEAN,
    "dyscalculia" BOOLEAN,
    "medication" TEXT,
    "medicalData" TEXT,
    "supportCurrent" TEXT,
    "supportPast" TEXT,
    "sourceDocumentName" TEXT,
    "versionLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentPerspective" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "currentDate" TIMESTAMP(3),
    "registrationNumber" TEXT,
    "currentSchoolYearGroup" TEXT,
    "currentTeacher" TEXT,
    "schoolOfOrigin" TEXT,
    "schoolHistory" TEXT,
    "startDateSpinaker" TIMESTAMP(3),
    "tlv" TEXT,
    "placementAge" TEXT,
    "didacticAgeAtPlacement" TEXT,
    "diagnosisDsmV" TEXT,
    "diagnosisSetBy" TEXT,
    "dyslexia" BOOLEAN,
    "dyscalculia" BOOLEAN,
    "medication" TEXT,
    "medicalData" TEXT,
    "supportCurrent" TEXT,
    "supportPast" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevelopmentPerspective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsychologicalAssessment" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "instrument" TEXT,
    "assessmentDate" TIMESTAMP(3),
    "examiner" TEXT,
    "institution" TEXT,
    "tiq" TEXT,
    "vb" TEXT,
    "vr" TEXT,
    "fr" TEXT,
    "wg" TEXT,
    "vs" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PsychologicalAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrativeImage" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3),
    "integrativeSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrativeImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportingHinderingFactor" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "domainName" TEXT NOT NULL,
    "supportingFactors" TEXT,
    "hinderingFactors" TEXT,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportingHinderingFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAttentionEducationNeed" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3),
    "relationStudentTeacher" TEXT,
    "relationStudentGroup" TEXT,
    "relationStudentSubjectMatter" TEXT,
    "miscellaneous" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAttentionEducationNeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentOverview" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "integrativeImageWithOutflow" TEXT,
    "diagnosis" TEXT,
    "homeSituation" TEXT,
    "externalSupport" TEXT,
    "schoolSituation" TEXT,
    "outflowPerspective" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevelopmentOverview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndependentTestGoal" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "goalLabel" TEXT,
    "measurementDate" TIMESTAMP(3),
    "dl" TEXT,
    "rekenen" TEXT,
    "begrijpendLezen" TEXT,
    "spelling" TEXT,
    "spellingWw" TEXT,
    "technischLezenDmt" TEXT,
    "technischLezenAvi" TEXT,
    "goalAchieved" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndependentTestGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndependentTestMeasurement" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "measurementDate" TIMESTAMP(3),
    "dl" TEXT,
    "rekenen" TEXT,
    "begrijpendLezen" TEXT,
    "spelling" TEXT,
    "spellingWw" TEXT,
    "technischLezenDmt" TEXT,
    "technischLezenAvi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndependentTestMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MethodBoundTest" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "periodLabel" TEXT,
    "rekenen" TEXT,
    "spelling" TEXT,
    "begrijpendLezen" TEXT,
    "taal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MethodBoundTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DidacticDevelopment" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3),
    "rekenen" TEXT,
    "spelling" TEXT,
    "technischLezen" TEXT,
    "begrijpendLezen" TEXT,
    "outflowExpectationAfterGroup8" TEXT,
    "educationNeeds" TEXT,
    "educationType" TEXT,
    "parentsOutflowExpectation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DidacticDevelopment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DidacticActionPlan" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "subjectArea" TEXT NOT NULL,
    "goalLabel" TEXT,
    "goalDescription" TEXT,
    "startDate" TIMESTAMP(3),
    "approach" TEXT,
    "extraSupportBy" TEXT,
    "achieved" BOOLEAN,
    "evaluation" TEXT,
    "evaluationDate" TIMESTAMP(3),
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DidacticActionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScolTeacherCompetency" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "entryDateLabel" TEXT,
    "strongCompetencies" TEXT,
    "developmentCompetencies" TEXT,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScolTeacherCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScolStudentCompetency" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "entryDateLabel" TEXT,
    "strongCompetencies" TEXT,
    "developmentCompetencies" TEXT,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScolStudentCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedagogicalActionPlan" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "learningArea" TEXT NOT NULL,
    "goalLabel" TEXT,
    "goalDescription" TEXT,
    "startDate" TIMESTAMP(3),
    "approach" TEXT,
    "achieved" BOOLEAN,
    "evaluation" TEXT,
    "evaluationDate" TIMESTAMP(3),
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedagogicalActionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentMeetingNote" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "noteDate" TIMESTAMP(3),
    "remarks" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentMeetingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileSignature" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "confirmationText" TEXT,
    "guardianName" TEXT,
    "childName" TEXT,
    "signatureDate" TIMESTAMP(3),
    "planType" TEXT,
    "guardian1Signed" BOOLEAN,
    "guardian2Signed" BOOLEAN,
    "student12PlusSigned" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileSignature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherStudent_teacherId_studentId_key" ON "TeacherStudent"("teacherId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentId_key" ON "StudentProfile"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "DevelopmentPerspective_profileId_key" ON "DevelopmentPerspective"("profileId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_primaryTeacherId_fkey" FOREIGN KEY ("primaryTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStudent" ADD CONSTRAINT "TeacherStudent_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStudent" ADD CONSTRAINT "TeacherStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevelopmentPerspective" ADD CONSTRAINT "DevelopmentPerspective_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychologicalAssessment" ADD CONSTRAINT "PsychologicalAssessment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrativeImage" ADD CONSTRAINT "IntegrativeImage_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportingHinderingFactor" ADD CONSTRAINT "SupportingHinderingFactor_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttentionEducationNeed" ADD CONSTRAINT "StudentAttentionEducationNeed_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevelopmentOverview" ADD CONSTRAINT "DevelopmentOverview_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndependentTestGoal" ADD CONSTRAINT "IndependentTestGoal_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndependentTestMeasurement" ADD CONSTRAINT "IndependentTestMeasurement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MethodBoundTest" ADD CONSTRAINT "MethodBoundTest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DidacticDevelopment" ADD CONSTRAINT "DidacticDevelopment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DidacticActionPlan" ADD CONSTRAINT "DidacticActionPlan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScolTeacherCompetency" ADD CONSTRAINT "ScolTeacherCompetency_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScolStudentCompetency" ADD CONSTRAINT "ScolStudentCompetency_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedagogicalActionPlan" ADD CONSTRAINT "PedagogicalActionPlan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentMeetingNote" ADD CONSTRAINT "ParentMeetingNote_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileSignature" ADD CONSTRAINT "ProfileSignature_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
