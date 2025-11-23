/*
  Warnings:

  - You are about to drop the `AdminConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."AdminConfig";

-- CreateTable
CREATE TABLE "adminConfig" (
    "id" SERIAL NOT NULL,
    "opening_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closing_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "min_duration" DOUBLE PRECISION NOT NULL DEFAULT 0.5,

    CONSTRAINT "adminConfig_pkey" PRIMARY KEY ("id")
);
