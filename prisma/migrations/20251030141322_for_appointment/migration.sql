/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "appointment" ALTER COLUMN "date" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "appointment_date_key" ON "appointment"("date");
