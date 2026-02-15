/*
  Warnings:

  - You are about to drop the `AdminConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."AdminConfig";

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" SERIAL NOT NULL,
    "opening_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closing_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "min_duration" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "support_email" TEXT NOT NULL DEFAULT 'support@malexhandy.com',
    "phone_number" TEXT NOT NULL DEFAULT '3474101444',

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);
