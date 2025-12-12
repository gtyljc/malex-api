/*
  Warnings:

  - You are about to drop the `admin_config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `appointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."admin_config";

-- DropTable
DROP TABLE "public"."appointment";

-- DropTable
DROP TABLE "public"."work";

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "surname" VARCHAR(50) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "job_desc" TEXT NOT NULL,
    "bwt" "BwtChoice" NOT NULL,
    "number" VARCHAR(20),
    "duration" INTEGER NOT NULL DEFAULT 1,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" SERIAL NOT NULL,
    "img_url" VARCHAR(2800) NOT NULL,
    "img_id" VARCHAR(50) NOT NULL,
    "category" "CategoryChoice" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminConfig" (
    "id" SERIAL NOT NULL,
    "opening_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closing_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "min_duration" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "support_email" TEXT NOT NULL DEFAULT 'support@malexhandy.com',
    "phone_number" TEXT NOT NULL DEFAULT '3474101444',

    CONSTRAINT "AdminConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_number_key" ON "Appointment"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_date_key" ON "Appointment"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Work_img_id_key" ON "Work"("img_id");
