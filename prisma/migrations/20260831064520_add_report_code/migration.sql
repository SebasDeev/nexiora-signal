/*
  Warnings:

  - A unique constraint covering the columns `[reportCode]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropIndex
DROP INDEX "public"."Report_createdAt_idx";

-- DropIndex
DROP INDEX "public"."Report_status_idx";

-- DropIndex
DROP INDEX "public"."Report_userId_idx";

-- AlterTable
ALTER TABLE "public"."Report" ADD COLUMN     "address" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "reportCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Report_reportCode_key" ON "public"."Report"("reportCode");

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
