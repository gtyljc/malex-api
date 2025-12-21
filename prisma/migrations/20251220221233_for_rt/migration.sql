/*
  Warnings:

  - You are about to drop the column `used_id` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "used_id",
ADD COLUMN     "user_id" TEXT NOT NULL;
