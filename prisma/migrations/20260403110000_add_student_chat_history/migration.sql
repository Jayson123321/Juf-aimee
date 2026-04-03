CREATE TYPE "StudentChatRole" AS ENUM ('USER', 'ASSISTANT');

CREATE TABLE "StudentChatSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentChatSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "StudentChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudentChatSession_studentId_key" ON "StudentChatSession"("studentId");
CREATE INDEX "StudentChatMessage_sessionId_createdAt_idx" ON "StudentChatMessage"("sessionId", "createdAt");

ALTER TABLE "StudentChatSession" ADD CONSTRAINT "StudentChatSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentChatMessage" ADD CONSTRAINT "StudentChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudentChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
