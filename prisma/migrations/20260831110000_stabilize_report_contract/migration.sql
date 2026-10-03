-- Preserve the query indexes removed while adding reportCode and retain the
-- citizen-friendly failure classification alongside the original Report fields.
ALTER TABLE "public"."Report" ADD COLUMN "failureType" TEXT;

CREATE INDEX "Report_userId_idx" ON "public"."Report"("userId");
CREATE INDEX "Report_status_idx" ON "public"."Report"("status");
CREATE INDEX "Report_createdAt_idx" ON "public"."Report"("createdAt");
