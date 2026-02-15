/*
  Warnings:

  - You are about to drop the column `img_url` on the `work` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[img_urls]` on the table `work` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `img_urls` to the `work` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."work_img_url_key";

-- AlterTable
ALTER TABLE "work" DROP COLUMN "img_url",
ADD COLUMN     "img_urls" VARCHAR(2800) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "work_img_urls_key" ON "work"("img_urls");
