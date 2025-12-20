/*
  Warnings:

  - Added the required column `audience` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "audience" TEXT NOT NULL;
