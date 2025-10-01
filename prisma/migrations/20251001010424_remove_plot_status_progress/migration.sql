/*
  Warnings:

  - You are about to drop the column `progress` on the `plots` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `plots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."plots" DROP COLUMN "progress",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "public"."plot_status";
