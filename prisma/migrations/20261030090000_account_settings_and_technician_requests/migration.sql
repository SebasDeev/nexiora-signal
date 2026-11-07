-- Account-session invalidation lets a password update expire every prior token.
ALTER TABLE "public"."User"
  ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TYPE "public"."TechnicianRequestStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED'
);

CREATE TABLE "public"."TechnicianRequest" (
  "id" TEXT NOT NULL,
  "experience" TEXT NOT NULL,
  "motivation" TEXT,
  "status" "public"."TechnicianRequestStatus" NOT NULL DEFAULT 'PENDING',
  "reviewNote" TEXT,
  "userId" TEXT NOT NULL,
  "reviewerId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TechnicianRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TechnicianRequest_userId_createdAt_idx"
  ON "public"."TechnicianRequest"("userId", "createdAt");
CREATE INDEX "TechnicianRequest_status_createdAt_idx"
  ON "public"."TechnicianRequest"("status", "createdAt");
CREATE INDEX "TechnicianRequest_reviewerId_idx"
  ON "public"."TechnicianRequest"("reviewerId");

-- A citizen can keep historical requests, but never submit two pending reviews.
CREATE UNIQUE INDEX "TechnicianRequest_one_pending_per_user"
  ON "public"."TechnicianRequest"("userId")
  WHERE "status" = 'PENDING';

ALTER TABLE "public"."TechnicianRequest"
  ADD CONSTRAINT "TechnicianRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."TechnicianRequest"
  ADD CONSTRAINT "TechnicianRequest_reviewerId_fkey"
  FOREIGN KEY ("reviewerId") REFERENCES "public"."User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
