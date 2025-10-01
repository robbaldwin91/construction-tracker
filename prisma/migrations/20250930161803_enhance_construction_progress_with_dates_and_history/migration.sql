/*
  Warnings:

  - You are about to drop the column `recordedAt` on the `construction_progress` table. All the data in the column will be lost.
  - You are about to drop the column `minimumSalePrice` on the `plots` table. All the data in the column will be lost.
  - You are about to drop the `planned_delivery_dates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sales_updates` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[plotId,constructionStageId]` on the table `construction_progress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."planned_delivery_dates" DROP CONSTRAINT "planned_delivery_dates_salesUpdateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sales_updates" DROP CONSTRAINT "sales_updates_plotId_fkey";

-- DropIndex
DROP INDEX "public"."construction_progress_plotId_constructionStageId_recordedAt_key";

-- AlterTable
ALTER TABLE "public"."construction_progress" DROP COLUMN "recordedAt",
ADD COLUMN     "actualEndDate" TIMESTAMP(3),
ADD COLUMN     "actualStartDate" TIMESTAMP(3),
ADD COLUMN     "plannedEndDate" TIMESTAMP(3),
ADD COLUMN     "plannedStartDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."plots" DROP COLUMN "minimumSalePrice";

-- DropTable
DROP TABLE "public"."planned_delivery_dates";

-- DropTable
DROP TABLE "public"."sales_updates";

-- CreateTable
CREATE TABLE "public"."construction_plan_history" (
    "id" TEXT NOT NULL,
    "constructionProgressId" TEXT NOT NULL,
    "plannedStartDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "reason" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "construction_plan_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "construction_progress_plotId_constructionStageId_key" ON "public"."construction_progress"("plotId", "constructionStageId");

-- AddForeignKey
ALTER TABLE "public"."construction_plan_history" ADD CONSTRAINT "construction_plan_history_constructionProgressId_fkey" FOREIGN KEY ("constructionProgressId") REFERENCES "public"."construction_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
