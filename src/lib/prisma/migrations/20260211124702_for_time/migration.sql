/*
  Warnings:

  - The `opening_at` column on the `SiteConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `closing_at` column on the `SiteConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[img_url]` on the table `Work` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "last_session" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(0);

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(0),
ALTER COLUMN "expired_at" SET DATA TYPE TIMESTAMPTZ(0);

-- AlterTable
ALTER TABLE "SiteConfig" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
DROP COLUMN "opening_at",
ADD COLUMN     "opening_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "closing_at",
ADD COLUMN     "closing_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Work" ALTER COLUMN "timestamp" SET DATA TYPE TIMESTAMPTZ(0);

-- CreateIndex
CREATE UNIQUE INDEX "Work_img_url_key" ON "Work"("img_url");
