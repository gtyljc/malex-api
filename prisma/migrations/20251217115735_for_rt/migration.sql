/*
  Warnings:

  - Changed the type of `audience` on the `RefreshToken` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "audience",
ADD COLUMN     "audience" "Role" NOT NULL;
