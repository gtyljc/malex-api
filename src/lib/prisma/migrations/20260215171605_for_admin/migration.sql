/*
  Warnings:

  - You are about to drop the column `is_logged` on the `Admin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "is_logged";

-- AlterTable
ALTER TABLE "SiteConfig" ALTER COLUMN "min_duration" DROP DEFAULT,
ALTER COLUMN "support_email" DROP DEFAULT,
ALTER COLUMN "phone_number" DROP DEFAULT,
ALTER COLUMN "timezone" DROP DEFAULT,
ALTER COLUMN "opening_at" DROP DEFAULT,
ALTER COLUMN "closing_at" DROP DEFAULT;
