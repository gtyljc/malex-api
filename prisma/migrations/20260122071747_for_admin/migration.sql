/*
  Warnings:

  - You are about to drop the column `number` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `email` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Appointment_number_key";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "email" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "number",
ADD COLUMN     "phone_number" VARCHAR(20),
ALTER COLUMN "duration" DROP DEFAULT;
