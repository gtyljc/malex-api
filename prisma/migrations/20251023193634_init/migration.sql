-- CreateEnum
CREATE TYPE "BwtChoice" AS ENUM ('WHATSAPP', 'PHONE', 'TEXT');

-- CreateEnum
CREATE TYPE "CategoryChoice" AS ENUM ('PLUMBING', 'ASSEMBLING', 'MOUNTING');

-- CreateTable
CREATE TABLE "appointment" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "surname" VARCHAR(50) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "job_desc" TEXT NOT NULL,
    "bwt" "BwtChoice" NOT NULL,
    "number" VARCHAR(20),
    "duration" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work" (
    "id" SERIAL NOT NULL,
    "img_url" VARCHAR(2800) NOT NULL,
    "img_id" VARCHAR(50) NOT NULL DEFAULT '',
    "category" "CategoryChoice" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointment_number_key" ON "appointment"("number");

-- CreateIndex
CREATE UNIQUE INDEX "work_img_url_key" ON "work"("img_url");

-- CreateIndex
CREATE UNIQUE INDEX "work_img_id_key" ON "work"("img_id");
