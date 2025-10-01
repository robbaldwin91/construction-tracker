-- AlterTable
ALTER TABLE "public"."plots" ADD COLUMN     "constructionTypeId" TEXT,
ADD COLUMN     "homebuilderId" TEXT,
ADD COLUMN     "minimumSalePrice" DECIMAL(65,30),
ADD COLUMN     "numberOfBeds" INTEGER,
ADD COLUMN     "numberOfStoreys" INTEGER,
ADD COLUMN     "squareFootage" DOUBLE PRECISION,
ADD COLUMN     "streetAddress" TEXT,
ADD COLUMN     "unitTypeId" TEXT;

-- CreateTable
CREATE TABLE "public"."homebuilders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homebuilders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."construction_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."construction_stages" (
    "id" TEXT NOT NULL,
    "constructionTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unit_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales_updates" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "programmedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."planned_delivery_dates" (
    "id" TEXT NOT NULL,
    "salesUpdateId" TEXT NOT NULL,
    "plannedDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planned_delivery_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."construction_progress" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "constructionStageId" TEXT NOT NULL,
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "homebuilders_name_key" ON "public"."homebuilders"("name");

-- CreateIndex
CREATE UNIQUE INDEX "construction_types_name_key" ON "public"."construction_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "construction_stages_constructionTypeId_sortOrder_key" ON "public"."construction_stages"("constructionTypeId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "unit_types_name_key" ON "public"."unit_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "construction_progress_plotId_constructionStageId_recordedAt_key" ON "public"."construction_progress"("plotId", "constructionStageId", "recordedAt");

-- AddForeignKey
ALTER TABLE "public"."plots" ADD CONSTRAINT "plots_homebuilderId_fkey" FOREIGN KEY ("homebuilderId") REFERENCES "public"."homebuilders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plots" ADD CONSTRAINT "plots_constructionTypeId_fkey" FOREIGN KEY ("constructionTypeId") REFERENCES "public"."construction_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plots" ADD CONSTRAINT "plots_unitTypeId_fkey" FOREIGN KEY ("unitTypeId") REFERENCES "public"."unit_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."construction_stages" ADD CONSTRAINT "construction_stages_constructionTypeId_fkey" FOREIGN KEY ("constructionTypeId") REFERENCES "public"."construction_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_updates" ADD CONSTRAINT "sales_updates_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "public"."plots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."planned_delivery_dates" ADD CONSTRAINT "planned_delivery_dates_salesUpdateId_fkey" FOREIGN KEY ("salesUpdateId") REFERENCES "public"."sales_updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."construction_progress" ADD CONSTRAINT "construction_progress_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "public"."plots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."construction_progress" ADD CONSTRAINT "construction_progress_constructionStageId_fkey" FOREIGN KEY ("constructionStageId") REFERENCES "public"."construction_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
