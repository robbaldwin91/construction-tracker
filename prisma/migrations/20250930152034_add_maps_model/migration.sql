-- CreateMapTable
CREATE TABLE "public"."maps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "naturalWidth" INTEGER,
    "naturalHeight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "maps_pkey" PRIMARY KEY ("id")
);

-- AddMapIdColumnToPlots
ALTER TABLE "public"."plots" ADD COLUMN "mapId" TEXT;

-- SeedDefaultWelbourneMap
INSERT INTO "public"."maps" ("id", "name", "slug", "imagePath", "createdAt", "updatedAt")
SELECT 'map_welbourne_default', 'Welbourne', 'welbourne', '/Welbourne - Dashwood.jpg', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."maps" WHERE "slug" = 'welbourne'
);

-- AssignExistingPlotsToWelbourne
UPDATE "public"."plots" SET "mapId" = (
    SELECT "id" FROM "public"."maps" WHERE "slug" = 'welbourne' LIMIT 1
)
WHERE "mapId" IS NULL;

-- EnforceNotNullOnMapId
ALTER TABLE "public"."plots" ALTER COLUMN "mapId" SET NOT NULL;

-- CreateMapSlugUnique
CREATE UNIQUE INDEX "maps_slug_key" ON "public"."maps"("slug");

-- CreatePlotsMapNameUnique
CREATE UNIQUE INDEX "plots_mapId_name_key" ON "public"."plots"("mapId", "name");

-- AddPlotsMapIdForeignKey
ALTER TABLE "public"."plots"
ADD CONSTRAINT "plots_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "public"."maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
