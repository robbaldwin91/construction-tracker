/*
  Warnings:

  - A unique constraint covering the columns `[constructionProgressId,versionNumber]` on the table `construction_plan_history` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `versionNumber` to the `construction_plan_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."construction_plan_history" ADD COLUMN     "versionNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."construction_progress" ADD COLUMN     "currentPlanVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "construction_plan_history_constructionProgressId_versionNum_key" ON "public"."construction_plan_history"("constructionProgressId", "versionNumber");
