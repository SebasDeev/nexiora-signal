-- Replace the former operational role with the explicit leader role.
ALTER TYPE "public"."UserRole" RENAME VALUE 'OPERATOR' TO 'LEADER';

-- Authentication identity and single-admin protection.
ALTER TABLE "public"."User" ADD COLUMN "username" TEXT;
UPDATE "public"."User"
SET "username" = LOWER(CONCAT('user_', SUBSTRING("id" FROM 1 FOR 18)))
WHERE "username" IS NULL;
ALTER TABLE "public"."User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");
CREATE UNIQUE INDEX "User_single_admin_key" ON "public"."User"("role") WHERE "role" = 'ADMIN';

-- Operational workflow additions do not alter historical reports.
ALTER TYPE "public"."ReportStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
CREATE TYPE "public"."ReportPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
ALTER TABLE "public"."Report"
  ADD COLUMN "priority" "public"."ReportPriority" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN "assignedTechnicianId" TEXT;
CREATE INDEX "Report_assignedTechnicianId_idx" ON "public"."Report"("assignedTechnicianId");
ALTER TABLE "public"."Report"
  ADD CONSTRAINT "Report_assignedTechnicianId_fkey"
  FOREIGN KEY ("assignedTechnicianId") REFERENCES "public"."User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "public"."ReportEvidence" (
  "id" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "note" TEXT,
  "reportId" TEXT NOT NULL,
  "uploadedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReportEvidence_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ReportEvidence_reportId_idx" ON "public"."ReportEvidence"("reportId");
CREATE INDEX "ReportEvidence_uploadedById_idx" ON "public"."ReportEvidence"("uploadedById");
ALTER TABLE "public"."ReportEvidence"
  ADD CONSTRAINT "ReportEvidence_reportId_fkey"
  FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ReportEvidence"
  ADD CONSTRAINT "ReportEvidence_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
