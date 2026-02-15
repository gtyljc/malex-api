/*
  Warnings:

  - You are about to drop the column `img_urls` on the `work` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "work" DROP COLUMN "img_urls",
ADD COLUMN     "img_url" VARCHAR(2800) NOT NULL DEFAULT '';
