/*
  Warnings:

  - The primary key for the `Admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `fullname` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `is_super` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Admin` table. All the data in the column will be lost.
  - The `id` column on the `Admin` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Appointment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Appointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `RefreshToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `RefreshToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `user_id` column on the `RefreshToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `SiteConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `SiteConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Work` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Work` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[super_admin_id]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `SiteConfig` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[admin_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Work` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_pkey",
DROP COLUMN "email",
DROP COLUMN "fullname",
DROP COLUMN "is_super",
DROP COLUMN "password",
DROP COLUMN "username",
ADD COLUMN     "super_admin_id" SMALLINT,
DROP COLUMN "id",
ADD COLUMN     "id" SMALLSERIAL NOT NULL,
ADD CONSTRAINT "Admin_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER,
ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SiteConfig" DROP CONSTRAINT "SiteConfig_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SMALLSERIAL NOT NULL,
ADD CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "admin_id" INTEGER,
ADD COLUMN     "email" VARCHAR(50) NOT NULL,
ADD COLUMN     "fullname" VARCHAR(50) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Work" DROP CONSTRAINT "Work_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Work_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "SuperAdmin" (
    "id" SMALLSERIAL NOT NULL,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_super_admin_id_key" ON "Admin"("super_admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_id_key" ON "Appointment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SiteConfig_id_key" ON "SiteConfig"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_admin_id_key" ON "User"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "Work_id_key" ON "Work"("id");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_super_admin_id_fkey" FOREIGN KEY ("super_admin_id") REFERENCES "SuperAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
